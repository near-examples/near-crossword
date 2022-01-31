import { ThemeProvider } from "styled-components";
import Crossword from "react-crossword";
import React from "react";

const CrosswordPage = ({ data, onCrosswordComplete }) => {
  return (
    <div className="content">
      <div style={{ width: "100vw" }}>
        <ThemeProvider
          theme={{
            columnBreakpoint: "9999px",
            gridBackground: "#fff",
            cellBackground: "#9FB9FC",
            cellBorder: "#dfe8fe",
            textColor: "#dae3ff",
            numberColor: "#000000",
            focusBackground: "#5F8AFA",
            highlightBackground: "#EFF4FF",
          }}
        >
          <Crossword data={data} onCrosswordComplete={onCrosswordComplete} />
        </ThemeProvider>
      </div>
    </div>
  );
};

export default CrosswordPage;
