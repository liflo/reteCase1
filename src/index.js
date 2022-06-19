import React from "react";
import ReactDOM from "react-dom";
import { createEditor } from "./rete";

import "./styles.css";

function App() {
  return (
    <div className="App">
      <div style={{ textAlign: "left", width: "300vw", height: "120vh" }}>
        <div ref={ref => ref && createEditor(ref)} />
      </div>
    </div>
  );
}

const rootElement = document.getElementById("root");
ReactDOM.render(<App />, rootElement);
