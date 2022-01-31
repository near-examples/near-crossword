import React from "react";

const NoCrosswordsPage = () => {
  return (
    <div className="container no-puzzles">
      <div className="successful-page-title">All puzzles have been solved</div>

      <div className="successful-text">
        Sorry friend, no crossword puzzles available at this time.
      </div>
      <div className="successful-text">
        In the meantime, check out the links below.
      </div>
      <div className="arrows" />
      <div className="success-links">
        <div className="success-link">
          <div className="bridge-text">For Developers </div>
          <a
            href="https://examples.near.org?from=crossword"
            className="near-link"
            target="_blank"
          >
            NEAR Examples
          </a>
        </div>
        <div className="success-link">
          <div className="bridge-text">DeFi, NFTs, games, comics, etc. </div>
          <a
            href="https://awesomenear.com?from=crossword"
            className="near-link"
            target="_blank"
          >
            Awesome NEAR projects
          </a>
        </div>
      </div>
    </div>
  );
};
export default NoCrosswordsPage;
