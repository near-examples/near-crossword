import React from "react";

const SuccessPage = ()=>{
    return (
        <div className="container">
            <div className="title">Reward was claimed!</div>
            <div className="error-msg">Transaction with reward was successfully sent. In the meantime,<br/>try to solve one more puzzle</div>
            <div className="content"><a href="/" className="btn">Solve crossword</a></div>
        </div>
    );
}

export default SuccessPage;
