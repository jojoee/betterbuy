import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { compare } from "../src/calculator";

function setInput(key: string, value: string): void {
  const input = document.querySelector<HTMLInputElement>(`[data-key="${key}"]`);
  if (!input) throw new Error(`Input ${key} not found`);
  input.value = value;
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

async function renderApp(): Promise<void> {
  vi.resetModules();
  await import("../src/main");
}

function savedEntry(id: string) {
  return {
    id,
    input: { costA: 1, sizeA: 1, costB: 2, sizeB: 1 },
    result: compare({ costA: 1, sizeA: 1, costB: 2, sizeB: 1 })!,
    savedAt: "2026-01-01T00:00:00.000Z",
  };
}

describe("browser app", () => {
  beforeEach(async () => {
    document.body.innerHTML = '<div id="app"></div>';
    localStorage.clear();
    vi.stubGlobal("crypto", { randomUUID: vi.fn(() => "saved-entry") });
    vi.spyOn(window, "scrollTo").mockImplementation(() => undefined);
    await renderApp();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("shows the invalid state, compares values, and saves a comparison", () => {
    expect(document.querySelector<HTMLButtonElement>("#save")?.disabled).toBe(
      true,
    );
    expect(document.body.textContent).toContain("Enter positive Cost and Size");

    setInput("costA", "40");
    setInput("sizeA", "500");
    setInput("costB", "70");
    setInput("sizeB", "1000");

    expect(document.body.textContent).toContain("B is 12.5% cheaper");
    document.querySelector<HTMLButtonElement>("#save")?.click();
    expect(document.body.textContent).toContain("1/50");
    expect(document.body.textContent).toContain("A 40 / 500");
  });

  it("restores and deletes saved comparisons", () => {
    setInput("costA", "1");
    setInput("sizeA", "1");
    setInput("costB", "2");
    setInput("sizeB", "1");
    document.querySelector<HTMLButtonElement>("#save")?.click();

    document.querySelector<HTMLButtonElement>("[data-restore]")?.click();
    expect(
      document.querySelector<HTMLInputElement>("[data-key=costA]")?.value,
    ).toBe("1");
    expect(window.scrollTo).toHaveBeenCalled();

    document.querySelector<HTMLButtonElement>("[data-delete]")?.click();
    expect(document.body.textContent).toContain("No saved comparisons yet.");
  });

  it("shows pins followed by unpinned history in two-row increments", async () => {
    localStorage.setItem(
      "betterbuy.history.v1",
      JSON.stringify(
        Array.from({ length: 10 }, (_, index) => savedEntry(String(index))),
      ),
    );
    await renderApp();

    expect(document.querySelector("header h1")?.textContent).toBe(
      "Betterbuy · Find the better deal",
    );

    for (let index = 0; index < 5; index++)
      document
        .querySelector<HTMLButtonElement>(`[data-pin="${index}"]`)
        ?.click();

    expect(document.body.textContent).toContain("10/50");
    expect(
      document.querySelectorAll("[data-history-group=pinned] li"),
    ).toHaveLength(5);
    expect(document.body.textContent).not.toContain("Recent");
    expect(document.body.textContent).not.toContain("Earlier");
    expect(
      document.querySelectorAll("[data-history-group=unpinned] li"),
    ).toHaveLength(2);
    expect(
      document.querySelector<HTMLButtonElement>(`[data-pin="5"]`)?.disabled,
    ).toBe(true);
    expect(document.querySelector("#pin-limit")?.textContent).toContain(
      "Unpin a saved comparison",
    );

    expect(document.querySelector("#show-more-history")?.textContent).toBe(
      "Show 2 more",
    );
    document.querySelector<HTMLButtonElement>("#show-more-history")?.click();
    expect(
      document.querySelectorAll("[data-history-group=unpinned] li"),
    ).toHaveLength(4);
    expect(document.querySelector("#show-more-history")?.textContent).toBe(
      "Show 1 more",
    );

    document.querySelector<HTMLButtonElement>("#show-more-history")?.click();
    expect(
      document.querySelectorAll("[data-history-group=unpinned] li"),
    ).toHaveLength(5);
    expect(document.querySelector("#show-more-history")).toBeNull();
    const ids = [
      ...document.querySelectorAll<HTMLElement>("[data-history-id]"),
    ].map((item) => item.dataset.historyId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
