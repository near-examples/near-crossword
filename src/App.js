import './App.css';
import React, { useCallback, useRef, useState } from 'react';
import Crossword from 'react-crossword';
import { parseSolutionSeedPhrase, b64toUtf8 } from './utils';
import { parseSeedPhrase } from 'near-seed-phrase';
import * as nearAPI from "near-api-js";
import { createGridData, loadGuesses } from "react-crossword/dist/es/util";
import SimpleDark from './loader';

const App = ({ nearConfig, data, creatorAccount }) => {
  const crossword = useRef();
  const [solvedPuzzle, setSolvedPuzzle] = useState(localStorage.getItem('playerSolvedPuzzle') || null);
  const playerKeyPair = JSON.parse(localStorage.getItem('playerKeyPair'));
  const crosswordSolutionPublicKey = localStorage.getItem('crosswordSolutionPublicKey');
  const [showLoader, setShowLoader] = useState(false);
  const [needsNewAccount, setNeedsNewAccount] = useState(false);
  const [claimError, setClaimError] = useState('');

  async function claimAccountType(e) {
    setNeedsNewAccount(e.target.value === 'create-account');
  }

  async function claimPrize() {
    const winner_account_id = document.getElementById('claim-account-id').value;
    const memo = document.getElementById('claim-memo').value;
    const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
    const keyPair = nearAPI.utils.key_pair.KeyPair.fromString(playerKeyPair.secretKey);
    await keyStore.setKey(nearConfig.networkId, nearConfig.contractName, keyPair);
    nearConfig.keyStore = keyStore;
    const near = await nearAPI.connect(nearConfig);
    const crosswordAccount = await near.account(nearConfig.contractName);

    let transaction;
    try {
      setShowLoader(true);

      // Call a different method depending on if the user wants to create an account or not
      if (needsNewAccount) {
        // There's a public key stored in local storage.
        // This was created when the user first opened the crossword puzzle.
        // They'll need to have written down their seed phrase
        // We pass the public key into the `new_pk` parameter

        transaction = await crosswordAccount.functionCall(
          {
            contractId: nearConfig.contractName,
            methodName: 'claim_reward_new_account',
            args: {
              crossword_pk: solvedPuzzle,
              new_acc_id: winner_account_id,
              new_pk: playerKeyPair.publicKey,
              memo
            },
            gas: '300000000000000', // You may omit this for default gas
            attachedDeposit: 0  // You may also omit this for no deposit
          }
        );
      } else {
        transaction = await crosswordAccount.functionCall(
          {
            contractId: nearConfig.contractName,
            methodName: 'claim_reward',
            args: {
              crossword_pk: solvedPuzzle,
              receiver_acc_id: winner_account_id,
              memo
            },
            gas: '300000000000000', // You may omit this for default gas
            attachedDeposit: 0  // You may also omit this for no deposit
          }
        );
      }
    } catch (e) {
      console.error('Unexpected error when claiming', e);
      if (e.message.contains('Can not sign transactions for account')) {
        // Someone has submitted the solution before the player!
        console.log("Oof, that's rough, someone already solved this.")
      }
    } finally {
      setShowLoader(false);
      // See if the transaction succeeded during transfer
      // or succeeded when creating a new account.
      // If unsuccessful, let the user try again.
      console.log('Transaction status:', transaction.status);
      const tx_succeeded = transaction.status.hasOwnProperty('SuccessValue');
      if (tx_succeeded) {
        let tx_success_value = b64toUtf8(transaction.status.SuccessValue);
        // Look for base64-encoded "false"
        if (tx_success_value === 'true') {
          // This tells the React app that it's solved and claimed
          setSolvedPuzzle(false);
          setClaimError('');

          // Clean up and get ready for next puzzle
          localStorage.removeItem('playerSolvedPuzzle');
          localStorage.removeItem('guesses');
        } else {
          if (needsNewAccount) {
            setClaimError('Could not create that account, please try another account name.');
          } else { 
            setClaimError("Couldn't transfer reward to that account, please try another account name or create a new one.");
          }
        }
      } else {
        // Transaction failed
        setClaimError(`Error with transaction: ${transaction.status.Failure}`);
        console.log('Error with transaction', transaction.status.Failure);
      }

      if (transaction.hasOwnProperty('transaction') &&
          transaction.transaction.hasOwnProperty('hash')) {
        console.log('Transaction hash:', transaction.transaction.hash);
      }
    }
  }

  const onCrosswordComplete = useCallback(
    async (completeCount) => {
      if (completeCount !== false) {
        let gridData = createGridData(data).gridData;
        loadGuesses(gridData, 'guesses');
        await checkSolution(gridData);
      }
    },
    []
  );

  // This function is called when all entries are filled
  async function checkSolution(gridData) {
    let seedPhrase = parseSolutionSeedPhrase(data, gridData);
    const { secretKey, publicKey } = parseSeedPhrase(seedPhrase);
    // Compare crossword solution's public key with the known public key for this puzzle
    // (It was given to us when we first fetched the puzzle in index.js)
    if (publicKey === crosswordSolutionPublicKey) {
      console.log("You're correct!");
      // Send transaction TO the crossword puzzle smart contract FROM the crossword puzzle account.
      // Learn more about access keys here: https://docs.near.org/docs/concepts/account#access-keys
      const keyStore = new nearAPI.keyStores.InMemoryKeyStore();
      const keyPair = nearAPI.utils.key_pair.KeyPair.fromString(secretKey);
      await keyStore.setKey(nearConfig.networkId, nearConfig.contractName, keyPair);
      nearConfig.keyStore = keyStore;
      const near = await nearAPI.connect(nearConfig);
      const crosswordAccount = await near.account(nearConfig.contractName);

      let playerPublicKey = playerKeyPair.publicKey;
      console.log('Unique public key for you as the player: ', playerPublicKey);

      let transaction;
      try {
        setShowLoader(true);
        transaction = await crosswordAccount.functionCall(
          {
            contractId: nearConfig.contractName,
            methodName: 'submit_solution',
            args: {
              solver_pk: playerPublicKey,
            },
            gas: '300000000000000', // You may omit this for default gas
            attachedDeposit: 0  // You may also omit this for no deposit
          }
        );
        localStorage.setItem('playerSolvedPuzzle', crosswordSolutionPublicKey);
        setSolvedPuzzle(crosswordSolutionPublicKey);
      } catch (e) {
        if (e.message.contains('Can not sign transactions for account')) {
          // Someone has submitted the solution before the player!
          console.log("Oof, that's rough, someone already solved this.")
        }
      } finally {
        setShowLoader(false);
        console.log('Transaction status:', transaction.status);
        console.log('Transaction hash:', transaction.transaction.hash);
      }
    } else {
      console.log("That's not the correct solution. :/");
    }
  }

  // There are four different "pages"
  // 1. The "loading screen" when transactions are hitting the blockchain
  // 2. The crossword puzzle interface, shown when there's a crossword puzzle to solve
  // 3. The crossword puzzle has been solved, and the reward needs to be claimed
  // 4. There are no crossword puzzles to solve and this user has claimed any they won
  if (showLoader) {
    return (
      <SimpleDark />
    )
  } else if (data && solvedPuzzle === null) {
    return (
      <div id="page">
        <h1>NEAR Crossword Puzzle</h1>
        <div id="crossword-wrapper">
          <Crossword
            data={data}
            ref={crossword}
            onCrosswordComplete={onCrosswordComplete}
          />
        </div>
        <footer>
          <p>Thank you <a href="https://github.com/JaredReisinger/react-crossword" target="_blank" rel="noreferrer">@jaredreisinger/react-crossword</a>!</p>
        </footer>
      </div>
    );
  } else if (solvedPuzzle) {
    let claimStatusClasses = 'hide';
    if (claimError !== '') {
      claimStatusClasses = 'show';
    }
    let seedPhraseClasses = 'hide';
    if (needsNewAccount) {
      seedPhraseClasses = 'show';
    }
    return (
      <div id="page" className="claim">
        <h1>You won!</h1>
        <span className="important">You still need to claim your prize.</span>
        <div id="claim-status" className={claimStatusClasses}><p>{claimError}</p></div>
        <div className="claim-inputs">
          <label htmlFor="claim-memo">Enter your winning memo:</label><br />
          <input type="text" id="claim-memo" name="claim-memo" placeholder="Alice strikes again!" /><br />
          <div>
            <input type="radio" id="have-account" name="account-funding-radio" value="have-account" checked={needsNewAccount === false} onChange={claimAccountType} />
            <label htmlFor="have-account">I have an account</label>
          </div>
          <div>
            <input type="radio" id="create-account" name="account-funding-radio" value="create-account" checked={needsNewAccount === true} onChange={claimAccountType} />
            <label htmlFor="create-account">I need to create an account</label>
          </div>
          <div id="seed-phrase-wrapper" className={seedPhraseClasses}>
            <h3>You need to write this down, friend.</h3>
            <p id="seed-phrase">{playerKeyPair.seedPhrase}</p>
            <p>After you submit and it succeeds, use this seed phrase at <a href={nearConfig.walletUrl} target="_blank">NEAR Wallet</a></p>
          </div>
          <label htmlFor="claim-account-id">Account name:</label><br />
          <input type="text" id="claim-account-id" name="claim-account-id" />
          <input type="submit" id="claim-button" className="btn btn-submit" onClick={claimPrize} />
        </div>
      </div>
    );
  } else if (!solvedPuzzle) {
    return (
      <div id="page" className="no-puzzles">
        <h1>All puzzles have been solved</h1>
        <p>Sorry friend, no crossword puzzles available at this time.</p>
        <p>In the meantime, check out the other <a href="https://near.dev">NEAR examples</a>. :)</p>
      </div>
    );
  }
}

export default App;
