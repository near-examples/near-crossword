const WonPage = () => {

    return (
        <div className="container">
            <div className="title">You won!</div>
            <div className="error-msg">You still need to claim your prize.</div>
            <div className="content">
                <form action="">
                    <div className="field-group">
                        <label htmlFor="memo" className="sr-only">Enter your winning memo:</label>
                        <input type="text" id="memo" placeholder="Enter your winning memo:"/>
                    </div>
                    <div className="field-group">
                        <div className="radio-field">
                            <input type="radio" id="have-account" name="account" value="yes"/>
                                <label htmlFor="have-account">I have an account</label>
                        </div>
                        <div className="radio-field">
                            <input type="radio" id="no-account" name="account" value="no"/>
                                <label htmlFor="no-account">I need to create an account</label>
                        </div>
                    </div>
                    <div className="field-group">
                        <label htmlFor="name" className="sr-only">Enter account name</label>
                        <input type="text" id="name" placeholder="Enter account name"/>
                    </div>
                    <button type="submit">Submit</button>
                </form>
            </div>
        </div>
);
}

export default WonPage;
