import "@testing-library/jest-dom/vitest";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { App } from "../src/main";
import { betterbuyStore } from "../src/store";

const pwa = vi.hoisted(() => ({
  updateServiceWorker: vi.fn(),
  useRegisterSW: vi.fn(),
}));

vi.mock("virtual:pwa-register/react", () => ({
  useRegisterSW: pwa.useRegisterSW,
}));

const emptyState = {
  values: {
    costA: Number.NaN,
    sizeA: Number.NaN,
    costB: Number.NaN,
    sizeB: Number.NaN,
  },
  history: [],
  isHistoryExpanded: false,
};

describe("React app", () => {
  beforeEach(() => {
    localStorage.clear();
    betterbuyStore.setState(emptyState);
    vi.stubGlobal("crypto", { randomUUID: vi.fn(() => "saved-entry") });
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    pwa.updateServiceWorker.mockResolvedValue(undefined);
    pwa.useRegisterSW.mockReturnValue({
      needRefresh: [false, vi.fn()],
      offlineReady: [false, vi.fn()],
      updateServiceWorker: pwa.updateServiceWorker,
    });
  });

  afterEach(() => {
    cleanup();
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  it("shows the invalid state, compares values, and saves a comparison", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(
      screen.getByRole("button", { name: "Save into history" }),
    ).toBeDisabled();
    expect(
      screen.getByText("Enter positive Cost and Size values to compare."),
    ).toBeInTheDocument();

    await user.type(screen.getByLabelText("A Cost"), "40");
    await user.type(screen.getByLabelText("A Size"), "500");
    await user.type(screen.getByLabelText("B Cost"), "70");
    await user.type(screen.getByLabelText("B Size"), "1000");

    expect(screen.getByText("B is 12.5% cheaper")).toBeInTheDocument();
    await user.click(screen.getByRole("button", { name: "Save into history" }));
    expect(screen.getByText("1/50")).toBeInTheDocument();
    expect(screen.getByText(/A 40 \/ 500/)).toBeInTheDocument();
  });

  it("restores, pins, expands, and deletes saved comparisons", async () => {
    const user = userEvent.setup();
    betterbuyStore.setState({
      ...emptyState,
      history: Array.from({ length: 5 }, (_, index) => ({
        id: String(index),
        input: { costA: 1, sizeA: 1, costB: 2, sizeB: 1 },
        result: {
          unitCostA: 1,
          unitCostB: 2,
          winner: "A" as const,
          savingPercent: 50,
        },
        savedAt: `2026-01-0${index + 1}`,
      })),
    });
    render(<App />);

    await user.click(screen.getByRole("button", { name: "Show more" }));
    expect(
      screen.getByRole("button", { name: "Show less" }),
    ).toBeInTheDocument();
    await user.click(
      screen.getAllByRole("button", { name: "Pin saved comparison" })[0]!,
    );
    expect(screen.getByText("Pinned (1)")).toBeInTheDocument();
    await user.click(
      screen.getAllByRole("button", { name: "Restore saved comparison" })[0]!,
    );
    expect(screen.getByLabelText("A Cost")).toHaveValue(1);
    expect(window.scrollTo).toHaveBeenCalled();
    await user.click(
      screen.getAllByRole("button", { name: "Delete saved comparison" })[0]!,
    );
    expect(screen.getByText("4/50")).toBeInTheDocument();
  });

  it("keeps a controlled numeric input focused across input events", () => {
    render(<App />);
    const input = screen.getByLabelText("A Cost");
    input.focus();
    fireEvent.change(input, { target: { value: "23", valueAsNumber: 23 } });
    expect(input).toHaveFocus();
    expect(input).toHaveValue(23);
  });

  it("offers a waiting update without reloading until the user chooses it", async () => {
    const user = userEvent.setup();
    pwa.useRegisterSW.mockReturnValue({
      needRefresh: [true, vi.fn()],
      offlineReady: [false, vi.fn()],
      updateServiceWorker: pwa.updateServiceWorker,
    });

    render(<App />);

    expect(screen.getByRole("status")).toHaveTextContent(
      "A new version of Betterbuy is ready.",
    );
    expect(pwa.updateServiceWorker).not.toHaveBeenCalled();

    await user.click(screen.getByRole("button", { name: "Update now" }));
    expect(pwa.updateServiceWorker).toHaveBeenCalledWith(true);
  });
});
