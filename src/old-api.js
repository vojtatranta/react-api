import React from "react";

export function OldAPIComponent(props) {
  const [state, setState] = React.useState({
    localCounter: 0,
  });

  return (
    <div>
      <h2>Standard API</h2>
      <ul>
        <li>
          Props: {JSON.stringify(props)}
          <div>
            <button
              onClick={() =>
                setState((prev) => ({
                  ...prev,
                  localCounter: prev.localCounter + 1,
                }))
              }
            >
              Increment local
            </button>
          </div>
          <div>
            <button
              onClick={() =>
                setTimeout(() => {
                  setState((prev) => ({
                    ...prev,
                    localCounter: prev.localCounter + 1,
                  }));
                }, 1000)
              }
            >
              Async increment local
            </button>
          </div>
        </li>
        <li>State: {JSON.stringify(state)}</li>
      </ul>
    </div>
  );
}
