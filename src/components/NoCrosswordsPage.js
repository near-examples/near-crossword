import React from 'react';

const NoCrosswordsPage = () => {
    return (
        <div className="container">
            <div className="title">All puzzles have been solved</div>
            <div className="error-msg">Sorry friend, no crossword puzzles available at this time. In the meantime,<br/>check
                out the other NEAR examples. :)
            </div>
            <div className="content"><a href="#" className="btn">NEAR Examples</a></div>
        </div>
    )
}
export default NoCrosswordsPage;
