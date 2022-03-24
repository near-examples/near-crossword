import getConfig from "./config";
import { connect, keyStores, WalletConnection } from "near-api-js";

class ApiManager {
  constructor() {}

  async setUp() {
    const nearConfig = getConfig(process.env.NEAR_ENV || 'testnet');
    const keyStore = new keyStores.BrowserLocalStorageKeyStore();
    nearConfig.keyStore = keyStore;
    this.near = await connect(nearConfig);
    this.wallet = new WalletConnection(this.near);
  }

  static _instance

  static async instance() {
    if (this._instance) { return this._instance }
    this._instance = new ApiManager()
    await this._instance.setUp()
    return this._instance
  }

  signIn() {
    if (!this.wallet.isSignedIn()) {
      this.wallet.requestSignIn({
        contractId: process.env.CONTRACT_NAME,
        methodNames: ['new_puzzle'],
        successUrl: window.location + 'success',
        failureUrl: window.location + 'fail'
      });
      return
    }
  }

  isSignedIn() {
    return this.wallet.isSignedIn()
  }
}

export default ApiManager;
