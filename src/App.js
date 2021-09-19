import './App.css';
import React, { useCallback, useRef, useState } from 'react';
import Crossword from 'react-crossword';
import { parseSolutionSeedPhrase } from './utils';
import { parseSeedPhrase } from 'near-seed-phrase';
import * as nearAPI from "near-api-js";
import { createGridData, loadGuesses } from "react-crossword/dist/es/util";
import SimpleDark from './loader';

const App = ({ nearConfig, data }) => {
  const crossword = useRef();
  const [solvedPuzzle, setSolvedPuzzle] = useState(localStorage.getItem('playerSolvedPuzzle') || null);
  const playerKeyPair = JSON.parse(localStorage.getItem('playerKeyPair'));
  const crosswordSolutionPublicKey = localStorage.getItem('crosswordSolutionPublicKey');
  const [showLoader, setShowLoader] = useState(false);

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
      localStorage.removeItem('playerSolvedPuzzle');
      localStorage.removeItem('guesses');
      setSolvedPuzzle(false);
    } catch (e) {
      if (e.message.contains('Can not sign transactions for account')) {
        // Someone has submitted the solution before the player!
        console.log("Oof, that's rough, someone already solved this.")
      }
    } finally {
      setShowLoader(false);
      console.log('Transaction status:', transaction.status);
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
    return (
      <div id="page" className="claim">
        <h1>You won!</h1>
        <span className="important">You still need to claim your prize.</span>
        <div className="claim-inputs">
          <label htmlFor="claim-memo">Enter your winning memo:</label><br />
          <input type="text" id="claim-memo" name="claim-memo" placeholder="Alice strikes again!" /><br />
          <label htmlFor="claim-account-id">NEAR account (on {nearConfig.networkId}) to claim prize:</label><br />
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
