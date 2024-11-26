import React from "react";

export const SetStateContext = React.createContext({
  setState: () => {},
  onMount: () => {},
  onUnmount: () => {},
});

export function BetterAPIComponent(props, state, context) {
  context.onMount(() => {
    console.log("MOOUNTED");
  });

  return (
    <div>
      <h2>BetterAPI</h2>
      <ul>
        <li>
          Props: {JSON.stringify(props)}{" "}
          <div>
            <button
              onClick={() =>
                context.setState((prev) => ({
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
                  context.setState((prev) => ({
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

BetterAPIComponent.displayName = "BetterAPIComponent";

export const FactoriedBetterAPIComponent = BetterAPIComponentFactory(
  BetterAPIComponent,
  SetStateContext,
  { localCounter: 0 }
);

const contextFactory =
  ({ customFetch, setState }) =>
  (articleId) =>
    customFetch(`http://localhost:3000/api/articles/${articleId}`)
      .then((res) => res.json())
      .then((result) => {
        setState({
          apiResult: result,
        });
      });

function AsyncComponent(props, state, context) {
  return (
    <div>
      <button onClick={() => context.loadArticle(props.articleId)}>
        Load Article
      </button>
      <p>{state.apiResult ?? ""}</p>
    </div>
  );
}

export function BetterAPIComponentFactory(
  component,
  contextType = SetStateContext,
  defaultState = undefined
) {
  const ReturnFn = (props) => {
    const componentContext = React.useContext(contextType);
    const [state, setState] = React.useState(defaultState);
    const unmountRef = React.useRef(null);
    const mountRef = React.useRef(null);
    const contextWithSetState = React.useMemo(() => {
      return {
        ...componentContext,
        setState,
        onMount: (cb) => {
          mountRef.current = cb;
        },
        onUnmount: (cb) => {
          unmountRef.current = cb;
        },
      };
    }, [componentContext, setState]);

    React.useEffect(() => {
      if (mountRef.current) {
        mountRef.current();
      }
      return () => {
        if (unmountRef.current) {
          unmountRef.current();
        }
      };
    }, [componentContext]);

    const memoizedComponent = React.useCallback(
      () => component(props, state, contextWithSetState),
      [props, state, contextWithSetState]
    );
    return memoizedComponent();
  };

  ReturnFn.displayName = `FactoriedBetterAPIComponent(${component.displayName})`;

  return ReturnFn;
}
