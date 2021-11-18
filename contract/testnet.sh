#!/bin/bash

./build.sh

export NEAR_ACCT=xword.demo.testnet
near delete $NEAR_ACCT demo.testnet
near create-account $NEAR_ACCT --masterAccount demo.testnet
near deploy $NEAR_ACCT --wasmFile /Users/mike/near/near-crossword/contract/res/crossword.wasm --initFunction new --initArgs '{"creator_account": "linkdrop.demo.testnet"}'
echo "Keys before:"
near keys $NEAR_ACCT
near call $NEAR_ACCT new_puzzle '{
  "answer_pk": "ed25519:CpqWpFLps6zNNXSwn9ZYgvTgSVQ598fn1kWXgjcA2uLp",
  "dimensions": {
   "x": 19,
   "y": 13
  },
  "answers": [
   {
     "num": 1,
     "start": {
       "x": 1,
       "y": 2
     },
     "direction": "Across",
     "length": 8,
     "clue": "NEAR recently enabled this. We now have 4 of something on mainnet."
   },
   {
     "num": 1,
     "start": {
       "x": 1,
       "y": 2
     },
     "direction": "Down",
     "length": 10,
     "clue": "aloha.mike.near is called a ___ of mike.near"
   },
   {
     "num": 2,
     "start": {
       "x": 0,
       "y": 7
     },
     "direction": "Across",
     "length": 9,
     "clue": "You NEAR account can have full and function-call versions of this."
   },
   {
     "num": 3,
     "start": {
       "x": 7,
       "y": 4
     },
     "direction": "Down",
     "length": 7,
     "clue": "Since data on-chain is hard to read, some folks will set up this, which helps organize the info."
   },
   {
     "num": 4,
     "start": {
       "x": 5,
       "y": 5
     },
     "direction": "Across",
     "length": 11,
     "clue": "A special type of token used for DeFi, subscriptions, and art."
   },
   {
     "num": 5,
     "start": {
       "x": 7,
       "y": 10
     },
     "direction": "Across",
     "length": 3,
     "clue": "Remote Procedure Call"
   },
   {
     "num": 6,
     "start": {
       "x": 14,
       "y": 1
     },
     "direction": "Down",
     "length": 10,
     "clue": "One method of running smart contract tests capable of testing cross-contract calls."
   },
   {
     "num": 7,
     "start": {
       "x": 12,
       "y": 2
     },
     "direction": "Across",
     "length": 4,
     "clue": "Use this Rust macro over the initialization function."
   },
   {
     "num": 8,
     "start": {
       "x": 11,
       "y": 8
     },
     "direction": "Across",
     "length": 4,
     "clue": "Decentralized finance is known as"
   },
   {
     "num": 8,
     "start": {
       "x": 11,
       "y": 8
     },
     "direction": "Down",
     "length": 3,
     "clue": "A collective of people sharing activity, voting, spending, etc."
   }
  ]
}' --accountId mike.testnet --deposit 10

#echo "Keys after"
#near keys $NEAR_ACCT
#near view $NEAR_ACCT get_unsolved_puzzles
#near view $NEAR_ACCT debug_get_puzzle '{"pk": "ed25519:CpqWpFLps6zNNXSwn9ZYgvTgSVQ598fn1kWXgjcA2uLp"}'