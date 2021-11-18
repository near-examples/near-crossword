import React from 'react';

const NoCrosswordsPage = () => {
    return (
        <div className="container no-puzzles">
            <div className="title">All puzzles have been solved</div>
            <div className="error-msg">Sorry friend, no crossword puzzles available at this time.<br/>In the meantime, check out the links below. :)
            </div>
            <div className="content"><a href="https://examples.near.org?from=crossword" className="btn" target="_blank">NEAR Examples<br/>(for developers)</a></div>
            <div className="content"><a href="https://awesomenear.com?from=crossword" className="btn" target="_blank">Awesome NEAR projects.<br/>(DeFi, NFTs, games, comics…)</a></div>
        </div>
    )
}
export default NoCrosswordsPage;
