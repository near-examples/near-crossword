/*
This file is meant to be used as a demonstration of how to use
near-api-js to send a transaction that executes the FunctionCall Action.
For more snippets like this, please visit the cookbook here:
https://docs.near.org/docs/api/naj-cookbook
*/

const { connect, keyStores } = require("near-api-js");
const path = require("path");
const homedir = require("os").homedir();

const CREDENTIALS_DIR = ".near-credentials";
const CONTRACT_NAME = process.env.CONTRACT_NAME || "example.testnet";

const credentialsPath = path.join(homedir, CREDENTIALS_DIR);
const keyStore = new keyStores.UnencryptedFileSystemKeyStore(credentialsPath);

const config = {
    keyStore,
    networkId: "testnet",
    nodeUrl: "https://rpc.testnet.near.org",
};

sendTransactions();

async function sendTransactions() {
    const near = await connect({ ...config, keyStore });
    const account = await near.account(CONTRACT_NAME);
    const methodArgs = {
        answer_pk: "ed25519:CpqWpFLps6zNNXSwn9ZYgvTgSVQ598fn1kWXgjcA2uLp",
        dimensions: {
            "x": 19,
            "y": 13
        },
        answers: getPuzzleData()
    };
    const result = await account.functionCall({
        contractId: CONTRACT_NAME,
        methodName: "new_puzzle",
        args: Buffer.from(JSON.stringify(methodArgs)),
        gas: 300000000000000, // Optional, this is the maximum allowed case
        attachedDeposit: '10000000000000000000000000', // Optional, 10 NEAR
    });

    console.log(`https://explorer.testnet.near.org/transactions/${result.transaction.hash}`);
}

function getPuzzleData() {
    return [
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
    ];
}