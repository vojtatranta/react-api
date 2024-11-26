import { OldAPIComponent } from "./old-api";
import { render, screen } from "@testing-library/react";
import { act } from "react";

test("renders with props", () => {
  render(<OldAPIComponent counter={1} />);
  expect(screen.getByText(`Props: {"counter":1}`)).toBeInTheDocument();
});

test("renders with state", () => {
  render(<OldAPIComponent counter={1} />);
  expect(screen.getByText(`State: {"localCounter":0}`)).toBeInTheDocument();
});

test("increments local counter", () => {
  render(<OldAPIComponent counter={1} />);

  act(() => {
    screen
      .getByText("Increment local")
      .dispatchEvent(new MouseEvent("click", { bubbles: true }));
  });

  expect(screen.getByText(`State: {"localCounter":1}`)).toBeInTheDocument();
});
