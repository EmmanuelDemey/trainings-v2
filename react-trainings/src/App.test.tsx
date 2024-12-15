import { describe, expect, it, beforeEach, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import App from "./App";

vi.mock("react-router-dom", async () => {
  const actual = await vi.importActual("react-router-dom");
  return {
    ...actual,
    useNavigate: vi.fn(),
  };
});

describe("App", () => {
  beforeEach(() => {
    render(
      <MemoryRouter>
        <App />
      </MemoryRouter>,
    );
  });

  it("should check App is defined", () => {
    expect(screen).toBeDefined();
  });
});
