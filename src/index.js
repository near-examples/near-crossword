import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import getConfig from './config.js';
import { mungeBlockchainCrossword, viewMethodOnContract } from './utils';
import { generateSeedPhrase } from 'near-seed-phrase';

async function initCrossword() {
  const nearConfig = getConfig(process.env.NODE_ENV || 'testnet');

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
  if (chainData.length) {
    // Save the crossword solution's public key
    // Again, assuming there's only one crossword puzzle.
    localStorage.setItem('crosswordSolutionPublicKey', chainData[0]['solution_public_key']);
    data = mungeBlockchainCrossword(chainData);
  } else {
    console.log("Oof, there's no crossword to play right now, friend.");
  }


  return { nearConfig, data };
}

window.nearInitPromise = initCrossword()
  .then(({ nearConfig, data }) => {
    ReactDOM.render(
      <App
        nearConfig={nearConfig}
        data={data}
      />,
      document.getElementById('root'));
  });
