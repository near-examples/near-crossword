import React from "react";
import { motion } from "framer-motion/dist/framer-motion";

const WonPage = ({
  claimStatusClasses,
  claimError,
  needsNewAccount,
  setNeedsNewAccount,
  claimPrize,
  playerKeyPair,
  nearConfig,
}) => {
  const [inputMemo, setInputMemo] = useState("");
  const [inputName, setInputName] = useState("");
  const isButtonDisabled = !inputMemo || !inputName;
  return (
    <div className="win-page">
      <div className="title">You won!</div>
      <div className="error-wrap">
        <div className="error-icon"></div>
        <div className="win-page-error">
          You still need to claim your prize.
        </div>
      </div>
      <div className="content">
        <form action="">
          <div id="claim-status" className={claimStatusClasses}>
            <p>{claimError}</p>
          </div>
          <div className="field-group">
            <label htmlFor="claim-memo" className="sr-only">
              Enter your winning memo:
            </label>
            <input
              type="text"
              id="claim-memo"
              name="claim-memo"
              value={inputMemo}
              onChange={(e) => {
                setInputMemo(e.target.value);
              }}
              placeholder="Enter your winning memo:"
            />
          </div>
          <div className="field-group">
            <div
              className="radio-field"
              onClick={() => {
                setNeedsNewAccount(false);
              }}
            >
              <div
                className={`radio-button ${
                  needsNewAccount === false && "active"
                }`}
              >
                {needsNewAccount === false && (
                  <div className="radio-button-content" />
                )}
              </div>
              <div>I have an account</div>
            </div>
            <div className="radio-field">
              <div
                className="radio-field"
                onClick={() => {
                  setNeedsNewAccount(true);
                }}
              >
                <div
                  className={`radio-button ${
                    needsNewAccount === true && "active"
                  }`}
                >
                  {needsNewAccount === true && (
                    <div className="radio-button-content" />
                  )}
                </div>
                <div> I need to create an account</div>
              </div>
            </div>
          </div>

          <motion.div
            id="seed-phrase-wrapper"
            className="field-group"
            animate={{
              opacity: needsNewAccount === true ? 1 : 0,
              transitionEnd: {
                display: needsNewAccount === true ? "block" : "none",
              },
            }}
            transition={{ duration: 0.5 }}
          >
            <h3>You need to write this down, friend.</h3>
            <p id="seed-phrase">{playerKeyPair.seedPhrase}</p>
            <p>
              After you submit and it succeeds, use this seed phrase at{" "}
              <a href={nearConfig.walletUrl} target="_blank">
                NEAR Wallet
              </a>
            </p>
          </motion.div>

          <div className="field-group">
            <label htmlFor="claim-account-id" className="sr-only">
              Enter account name
            </label>
            <input
              type="text"
              id="claim-account-id"
              name="claim-account-id"
              placeholder="Enter account name"
              value={inputName}
              onChange={(e) => {
                setInputName(e.target.value);
              }}
            />
          </div>
          <div className="button-wrap">
            <button
              type="submit"
              className={`win-button ${isButtonDisabled ? "disabled" : ""}`}
              onClick={claimPrize}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default WonPage;
