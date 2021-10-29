import {ThemeProvider} from "styled-components";
import Crossword from "react-crossword";
import React from 'react';

const CrosswordPage = ({data,setSolvedPuzzle, onCrosswordComplete}) => {
    return (

        <div className="content">
            <div style={{ width: '100vw' }}>
                <ThemeProvider
                    theme={{
                        columnBreakpoint   : '9999px',
                        gridBackground     : '#fff',
                        cellBackground     : '#D5D5D5',
                        cellBorder         : '#D5D5D5',
                        textColor          : '#000000',
                        numberColor        : '#000000',
                        focusBackground    : 'rgba(170, 208, 85, 0.5)',
                        highlightBackground: 'rgba(255, 200, 96, 0.5)',
                    }}
                >
                    <Crossword data={data} onCrosswordComplete={onCrosswordComplete}/>
                    <a href="#" onClick={()=>setSolvedPuzzle(true)}>Won page</a>
                </ThemeProvider>

            </div>
        </div>

    );
}

export default CrosswordPage;
