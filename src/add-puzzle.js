import getConfig from './config.js';
import { connect, WalletConnection, keyStores, utils } from 'near-api-js';
import { generateNewPuzzleSeedPhrase } from './utils'
import { parseSeedPhrase } from 'near-seed-phrase';

export const addNewPuzzle = async (mungedLayout, layout, dimensions, prizeDeposit) => {
    const nearConfig = getConfig(process.env.NEAR_ENV || 'testnet');
    const keyStore = new keyStores.BrowserLocalStorageKeyStore();
    nearConfig.keyStore = keyStore;
    const near = await connect(nearConfig);
    const wallet = new WalletConnection(near);

    const cleanLayout = layout.map(clueAnswer => {
        // remove answer and capitalize direction value
        const {answer, direction, ...everythingElse} = clueAnswer
        const newDirection = direction === "down" ? "Down" : "Across"
        return {
            ...everythingElse,
            direction: newDirection
        }
    })

    const trueDeposit = utils.format.parseNearAmount(prizeDeposit)

    const account = wallet.account()

    const seedPhrase = generateNewPuzzleSeedPhrase(mungedLayout)
    const answer_pk = parseSeedPhrase(seedPhrase)

    const methodArgs = {
        answer_pk: answer_pk.publicKey,
        dimensions,
        answers: cleanLayout
    };

    const result = await account.functionCall({
        contractId: process.env.CONTRACT_NAME,
        methodName: "new_puzzle",
        args: Buffer.from(JSON.stringify(methodArgs)),
        gas: 300000000000000, // Optional, this is the maximum allowed case
        attachedDeposit: trueDeposit, // Optional, set to 0 NEAR by default
    });

}
