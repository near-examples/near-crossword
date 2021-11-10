import './App.css';
import React, {useCallback, useRef, useState} from 'react';
import {parseSolutionSeedPhrase, b64ToUtf8} from './utils';
import {parseSeedPhrase} from 'near-seed-phrase';
import * as nearAPI from "near-api-js";
import {createGridData, loadGuesses} from "react-crossword/dist/es/util";
import SimpleDark from './loader';
import CrosswordPage from "./components/CrosswordPage";
import NoCrosswordsPage from "./components/NoCrosswordsPage";
import WonPage from "./components/WonPage";
import SuccessPage from "./components/SuccessPage";

const logo = require('./img/logo_v2.png')


const App = ({nearConfig, data, creatorAccount}) => {
    console.log('data: ', data)
    const crossword = useRef();
    const [solvedPuzzle, setSolvedPuzzle] = useState(localStorage.getItem('playerSolvedPuzzle') || null);
    const playerKeyPair = JSON.parse(localStorage.getItem('playerKeyPair'));
    const crosswordSolutionPublicKey = localStorage.getItem('crosswordSolutionPublicKey');
    const [showLoader, setShowLoader] = useState(false);
    const [needsNewAccount, setNeedsNewAccount] = useState(false);
    const [claimError, setClaimError] = useState('');


    async function claimPrize(e) {
        e.preventDefault();
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
                        contractId     : nearConfig.contractName,
                        methodName     : 'claim_reward_new_account',
                        args           : {
                            crossword_pk: solvedPuzzle,
                            new_acc_id  : winner_account_id,
                            new_pk      : playerKeyPair.publicKey,
                            memo
                        },
                        gas            : '300000000000000', // You may omit this for default gas
                        attachedDeposit: 0  // You may also omit this for no deposit
                    }
                );
            } else {
                transaction = await crosswordAccount.functionCall(
                    {
                        contractId     : nearConfig.contractName,
                        methodName     : 'claim_reward',
                        args           : {
                            crossword_pk   : solvedPuzzle,
                            receiver_acc_id: winner_account_id,
                            memo
                        },
                        gas            : '300000000000000', // You may omit this for default gas
                        attachedDeposit: 0  // You may also omit this for no deposit
                    }
                );
                console.log('transaction: ', transaction)
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
                let tx_success_value = b64ToUtf8(transaction.status.SuccessValue);
                if (needsNewAccount) {
                    // Look for base64-encoded "false"
                    if (tx_success_value === 'true') {
                        // This tells the React app that it's solved and claimed
                        setSolvedPuzzle(false);
                        setClaimError('');

                        // Clean up and get ready for next puzzle
                        localStorage.removeItem('playerSolvedPuzzle');
                        localStorage.removeItem('guesses');
                    } else {
                        setClaimError('Could not create that account, please try another account name.');
                    }
                } else {
                    if (tx_success_value === 'true') {
                        // This tells the React app that it's solved and claimed
                        setSolvedPuzzle(false);
                        setClaimError('');
                        // Clean up and get ready for next puzzle
                        localStorage.removeItem('playerSolvedPuzzle');
                        localStorage.removeItem('guesses');
                    } else {
                        setClaimError("Couldn't transfer reward to that account, please try another account name or create a new one.")
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
        const {secretKey, publicKey} = parseSeedPhrase(seedPhrase);
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
                        contractId     : nearConfig.contractName,
                        methodName     : 'submit_solution',
                        args           : {
                            solver_pk: playerPublicKey,
                        },
                        gas            : '300000000000000', // You may omit this for default gas
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

    let claimStatusClasses = 'hide';
    if (claimError !== '') {
        claimStatusClasses = 'show';
    }
    let seedPhraseClasses = 'hide';
    if (needsNewAccount) {
        seedPhraseClasses = 'show';
    }

    // There are four different "pages"
    // 1. The "loading screen" when transactions are hitting the blockchain
    // 2. The crossword puzzle interface, shown when there's a crossword puzzle to solve
    // 3. The crossword puzzle has been solved, and the reward needs to be claimed
    // 4. There are no crossword puzzles to solve and this user has claimed any they won
    return (
        <div className="wrapper">
            <header className="site-header">
                <div className="site-logo">
                    <a href="#">
                        <img src={logo} width="271" alt="Near Crossword Puzzle"/>
                    </a>
                </div>
            </header>
            <main className="main-area">
                {showLoader && ( <SimpleDark/> )}
                {data && solvedPuzzle === null && (
                    <CrosswordPage
                        data={data}
                        setSolvedPuzzle={setSolvedPuzzle}
                        onCrosswordComplete={onCrosswordComplete}
                    /> )}
                {solvedPuzzle && (
                    <WonPage
                        claimStatusClasses={claimStatusClasses}
                        claimError={claimError}
                        needsNewAccount={needsNewAccount}
                        setNeedsNewAccount={setNeedsNewAccount}
                        claimPrize={claimPrize}
                        playerKeyPair={playerKeyPair}
                        nearConfig={nearConfig}
                    />
                )}
                {solvedPuzzle === false  && claimError === '' && (
                    <SuccessPage/>
                )}
                {!data && !solvedPuzzle && ( <NoCrosswordsPage/> )}
            </main>
        </div>
    );

}

export default App;
