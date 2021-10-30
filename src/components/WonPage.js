import React from "react";

const WonPage = ({
                     claimStatusClasses,
                     claimError,
                     needsNewAccount,
                     setNeedsNewAccount,
                     claimPrize,
                     playerKeyPair,
                     nearConfig
                 }) => {

    async function claimAccountType(e) {
        if (e.target.value === 'create-account') {
            setNeedsNewAccount(true);
        } else {
            setNeedsNewAccount(false);
        }
    }

    return (
        <div className="container">
            <div className="title">You won!</div>
            <div className="error-msg">You still need to claim your prize.</div>
            <div className="content">
                <form action="">
                    <div id="claim-status" className={claimStatusClasses}><p>{claimError}</p></div>
                    <div className="field-group">
                        <label htmlFor="claim-memo" className="sr-only">Enter your winning memo:</label>
                        <input type="text" id="claim-memo" name="claim-memo" placeholder="Enter your winning memo:"/>
                    </div>
                    <div className="field-group">
                        <div className="radio-field">
                            <input
                                type="radio"
                                id="have-account"
                                name="account-funding-radio"
                                value="have-account"
                                checked={needsNewAccount === false}
                                onChange={claimAccountType}
                           />
                            <label htmlFor="have-account">I have an account</label>
                        </div>
                        <div className="radio-field">
                            <input
                                type="radio"
                                id="create-account"
                                name="account-funding-radio"
                                value="create-account"
                                checked={needsNewAccount === true}
                                onChange={claimAccountType}
                            />
                            <label htmlFor="create-account">I need to create an account</label>
                        </div>
                    </div>
                    <div id="seed-phrase-wrapper" className="field-group">
                        <h3>You need to write this down, friend.</h3>
                        <p id="seed-phrase">{playerKeyPair.seedPhrase}</p>
                        <p>After you submit and it succeeds, use this seed phrase at <a href={nearConfig.walletUrl}
                                                                                        target="_blank">NEAR Wallet</a>
                        </p>
                    </div>
                    <div className="field-group">
                        <label htmlFor="claim-account-id" className="sr-only">Enter account name</label>
                        <input type="text" id="claim-account-id" name="claim-account-id"
                               placeholder="Enter account name"/>
                    </div>
                    <button type="submit" id="claim-button" onClick={claimPrize}>Submit</button>
                </form>
            </div>
        </div>
    );
}

export default WonPage;
