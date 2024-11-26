import { BetterAPIComponent } from "./better-api";
import { Maybe } from "actual-maybe";

const createSetStateMock = (defaultState) => {
  const state = {
    current: { ...defaultState },
  };

  let resolveCall = null;
  const onCallPromise = new Promise((resolve) => {
    resolveCall = resolve;
  });

  const setStateMock = jest.fn((parameter) => {
    if (typeof parameter === "function") {
      const newState = setStateMock(parameter(state.current));
      state.current = newState;
      resolveCall?.(newState);
      return newState;
    }

    state.current = parameter;
    resolveCall?.(parameter);
    return parameter;
  });

  return {
    state,
    setStateMock,
    onCallPromise,
  };
};

const findChildInStructure = (structure, findBy) => {
  if (!structure || !structure.props) {
    return [];
  }

  if (structure.props.children) {
    if (Array.isArray(structure.props.children)) {
      let results = [];
      for (const child of structure.props.children) {
        // Check current level
        if (findBy(child)) {
          results.push(child);
        }
        // Recursively check children
        results = results.concat(findChildInStructure(child, findBy));
      }
      return results;
    } else {
      // Single child case
      const child = structure.props.children;
      return findBy(child) ? [child] : findChildInStructure(child, findBy);
    }
  }

  return [];
};

test("render BetterAPIComponent with a button", () => {
  const renderedBetterComp = BetterAPIComponent(
    { counter: 2 },
    { localCounter: 0 },
    {}
  );

  expect(
    findChildInStructure(renderedBetterComp, (child) => child.type === "button")
  ).toHaveLength(2);
});

test("should render an externally passed props", () => {
  const renderedBetterComp = BetterAPIComponent(
    { counter: 2 },
    { localCounter: 0 }
  );

  const renderedProps = findChildInStructure(
    renderedBetterComp,
    (child) =>
      child.props?.children?.some?.((child) =>
        child.includes?.('{"counter":2}')
      ) && child.props?.children?.some?.((child) => child.includes?.("Props:"))
  );

  expect(renderedProps).toHaveLength(1);
});
test("should render state", () => {
  const renderedBetterComp = BetterAPIComponent(
    { counter: 0 },
    { localCounter: 1 }
  );

  const renderedProps = findChildInStructure(
    renderedBetterComp,
    (child) =>
      child.props?.children?.some?.((child) =>
        child.includes?.('{"localCounter":1}')
      ) && child.props?.children?.some?.((child) => child.includes?.("State:"))
  );

  expect(renderedProps).toHaveLength(1);
});

test("should increment local state", () => {
  const { setStateMock, state } = createSetStateMock({
    localCounter: 1,
  });

  const renderedBetterComp = BetterAPIComponent({ counter: 0 }, state.current, {
    setState: setStateMock,
  });

  Maybe.of(
    findChildInStructure(
      renderedBetterComp,
      (child) => child.type === "button"
    )[0]
  ).map((button) => button.props.onClick());

  expect(setStateMock).toHaveBeenCalledWith({ localCounter: 2 });
});

test("should render the incremented local state counter", () => {
  const { setStateMock, state } = createSetStateMock({
    localCounter: 1,
  });

  const renderedBetterComp = BetterAPIComponent({ counter: 0 }, state.current, {
    setState: setStateMock,
  });

  Maybe.of(
    findChildInStructure(
      renderedBetterComp,
      (child) => child.type === "button"
    )[0]
  ).map((button) => button.props.onClick());

  const updatedComponent = BetterAPIComponent({ counter: 0 }, state.current, {
    setState: setStateMock,
  });

  const updatedRendering = findChildInStructure(
    updatedComponent,
    (child) =>
      child.props?.children?.some?.((child) =>
        child.includes?.('{"localCounter":2}')
      ) && child.props?.children?.some?.((child) => child.includes?.("State:"))
  );

  expect(updatedRendering).toHaveLength(1);
});

test("should increment local state async", async () => {
  const { setStateMock, state, onCallPromise } = createSetStateMock({
    localCounter: 1,
  });

  const renderedBetterComp = BetterAPIComponent({ counter: 0 }, state.current, {
    setState: setStateMock,
  });

  Maybe.of(
    findChildInStructure(
      renderedBetterComp,
      (child) =>
        child.type === "button" && child.props.children.includes("Async")
    )[0]
  ).map((button) => button.props.onClick());

  await onCallPromise.then(() => {
    expect(setStateMock).toHaveBeenCalledWith({ localCounter: 2 });
  });
});
