import "./App.css";
import React from "react";
import { FactoriedBetterAPIComponent } from "./better-api";
import { OldAPIComponent } from "./old-api";
function App() {
  const [state, setState] = React.useState(0);
  return (
    <div className="App">
      <header className="App-header">
        <FactoriedBetterAPIComponent counter={state} />
        <button onClick={() => setState((state) => state + 1)}>
          Increment from App
        </button>
        <OldAPIComponent counter={state} />
      </header>
    </div>
  );
}

export default App;
