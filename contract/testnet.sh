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
     "clue": "clue for sharding"
   },
   {
     "num": 1,
     "start": {
       "x": 1,
       "y": 2
     },
     "direction": "Down",
     "length": 10,
     "clue": "clue for subaccount"
   },
   {
     "num": 2,
     "start": {
       "x": 0,
       "y": 7
     },
     "direction": "Across",
     "length": 9,
     "clue": "clue for accesskey"
   },
   {
     "num": 3,
     "start": {
       "x": 7,
       "y": 4
     },
     "direction": "Down",
     "length": 7,
     "clue": "clue for indexer"
   },
   {
     "num": 4,
     "start": {
       "x": 5,
       "y": 5
     },
     "direction": "Across",
     "length": 11,
     "clue": "clue for nonfungible"
   },
   {
     "num": 5,
     "start": {
       "x": 7,
       "y": 10
     },
     "direction": "Across",
     "length": 3,
     "clue": "clue for rpc"
   },
   {
     "num": 6,
     "start": {
       "x": 14,
       "y": 1
     },
     "direction": "Down",
     "length": 10,
     "clue": "clue for simulation"
   },
   {
     "num": 7,
     "start": {
       "x": 12,
       "y": 2
     },
     "direction": "Across",
     "length": 4,
     "clue": "clue for init"
   },
   {
     "num": 8,
     "start": {
       "x": 11,
       "y": 8
     },
     "direction": "Across",
     "length": 4,
     "clue": "clue for defi"
   },
   {
     "num": 8,
     "start": {
       "x": 11,
       "y": 8
     },
     "direction": "Down",
     "length": 3,
     "clue": "clue for dao"
   }
  ]
}' --accountId mike.testnet --deposit 10

#echo "Keys after"
#near keys $NEAR_ACCT
#near view $NEAR_ACCT get_unsolved_puzzles
#near view $NEAR_ACCT debug_get_puzzle '{"pk": "ed25519:CpqWpFLps6zNNXSwn9ZYgvTgSVQ598fn1kWXgjcA2uLp"}'