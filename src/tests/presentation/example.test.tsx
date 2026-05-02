import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

function ExampleComponent() {
  return <p>Hello</p>;
}

describe("presentation", () => {
  it("should render the component", () => {
    render(<ExampleComponent />);
    expect(screen.getByText("Hello")).toBeInTheDocument();
  });
});
