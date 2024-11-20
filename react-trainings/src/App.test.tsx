import { describe, expect, it, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import App from "./App";

describe("App", () => {
  beforeEach(() => {
    render(<App />);
  });

  it("should check title", () => {
    expect(screen.getByRole("heading", { level: 1 }).textContent).toContain(
      "Hello",
    );
  });

  it("check p content", () => {
    expect(screen.getByRole("table")).toBeDefined();
  });
});
