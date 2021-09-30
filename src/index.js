import "regenerator-runtime/runtime";
import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import getConfig from './config.js';
import { mungeBlockchainCrossword, viewMethodOnContract } from './utils';
import { generateSeedPhrase } from 'near-seed-phrase';

async function initCrossword() {
  const nearConfig = getConfig(process.env.NEAR_ENV || 'testnet');

  let existingKey = localStorage.getItem('playerKeyPair');

  if (!existingKey) {
    // Create a random key in here
    let seedPhrase = generateSeedPhrase();
    localStorage.setItem('playerKeyPair', JSON.stringify(seedPhrase));
  }

  // Get crossword puzzle using view method
  const chainData = await viewMethodOnContract(nearConfig, 'get_unsolved_puzzles');
  let data;

  // There may not be any crossword puzzles to solve, check this.
  if (chainData.puzzles.length) {
    // Save the crossword solution's public key
    // Again, assuming there's only one crossword puzzle.
    localStorage.setItem('crosswordSolutionPublicKey', chainData.puzzles[0]['solution_public_key']);
    data = mungeBlockchainCrossword(chainData.puzzles);
  } else {
    console.log("Oof, there's no crossword to play right now, friend.");
  }
  let creatorAccount = chainData.creator_account;

  return { nearConfig, data, creatorAccount };
}

window.nearInitPromise = initCrossword()
  .then(({ nearConfig, data, creatorAccount }) => {
    ReactDOM.render(
      <App
        nearConfig={nearConfig}
        data={data}
        creatorAccount={creatorAccount}
      />,
      document.getElementById('root'));
  });
