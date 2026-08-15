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
    vi.unstubAllEnvs();
    document.body.innerHTML = "";
  });

  it("shows the invalid state, compares values, and saves a comparison", () => {
    expect(
      Array.from(document.querySelector(".calculator")?.classList ?? []),
    ).toContain("ds-card");
    expect(
      document.querySelector("header")?.classList.contains("ds-page-header"),
    ).toBe(true);
    expect(
      document
        .querySelector(".calculator h2")
        ?.parentElement?.classList.contains("ds-section-header"),
    ).toBe(true);
    expect(document.querySelector(".history .ds-divider")).not.toBeNull();
    expect(document.querySelector(".ds-fieldset .ds-input")).not.toBeNull();
    expect(
      Array.from(document.querySelector("#save")?.classList ?? []),
    ).toContain("ds-button");
    expect(
      Array.from(document.querySelector(".options")?.classList ?? []),
    ).toContain("row");
    expect(document.querySelectorAll(".options .col-12.col-sm-6")).toHaveLength(
      2,
    );
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

  it("uses the empty-state contract without changing empty history copy", () => {
    const emptyHistory = document.querySelector(".empty-history");
    expect(emptyHistory?.classList.contains("ds-empty-state")).toBe(true);
    expect(emptyHistory?.textContent).toContain("No saved comparisons yet.");
  });

  it("keeps a numeric field focused across consecutive input events", () => {
    setInput("sizeA", "1");
    setInput("costB", "2");
    setInput("sizeB", "1");

    const costA =
      document.querySelector<HTMLInputElement>('[data-key="costA"]');
    if (!costA) throw new Error("Cost A input not found");
    costA.focus();

    costA.value = "2";
    costA.dispatchEvent(new Event("input", { bubbles: true }));

    expect(document.querySelector('[data-key="costA"]')).toBe(costA);
    expect(document.activeElement).toBe(costA);

    costA.value = "23";
    costA.dispatchEvent(new Event("input", { bubbles: true }));

    expect(document.querySelector('[data-key="costA"]')).toBe(costA);
    expect(document.activeElement).toBe(costA);
    expect(costA.value).toBe("23");
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

  it("shows pinned entries before three recent entries and expands all history", async () => {
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
    expect(document.querySelector(".history-group-title h3")?.textContent).toBe(
      "Pinned (5)",
    );
    expect(
      [...document.querySelectorAll(".history-group-title h3")].map(
        (heading) => heading.textContent,
      ),
    ).toEqual(["Pinned (5)"]);
    expect(
      document.querySelectorAll("[data-history-group=unpinned] li"),
    ).toHaveLength(3);
    expect(
      document.querySelector<HTMLButtonElement>(`[data-pin="5"]`)?.disabled,
    ).toBe(true);
    expect(document.querySelector("#pin-limit")?.textContent).toContain(
      "Unpin a saved comparison",
    );

    expect(document.querySelector("#show-more-history")?.textContent).toBe(
      "Show more",
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

  it("does not show an expansion control for three or fewer recent entries", async () => {
    localStorage.setItem(
      "betterbuy.history.v1",
      JSON.stringify(
        Array.from({ length: 3 }, (_, index) => savedEntry(String(index))),
      ),
    );
    await renderApp();

    expect(
      document.querySelectorAll("[data-history-group=unpinned] li"),
    ).toHaveLength(3);
    expect(document.querySelector("#show-more-history")).toBeNull();
  });

  it("keeps expanded history through actions and collapses after saving", async () => {
    localStorage.setItem(
      "betterbuy.history.v1",
      JSON.stringify(
        Array.from({ length: 5 }, (_, index) => savedEntry(String(index))),
      ),
    );
    await renderApp();

    document.querySelector<HTMLButtonElement>("#show-more-history")?.click();
    document.querySelector<HTMLButtonElement>(`[data-pin="0"]`)?.click();
    document.querySelector<HTMLButtonElement>(`[data-pin="0"]`)?.click();
    document.querySelector<HTMLButtonElement>(`[data-delete="0"]`)?.click();
    document.querySelector<HTMLButtonElement>(`[data-restore="1"]`)?.click();

    expect(
      document.querySelectorAll("[data-history-group=unpinned] li"),
    ).toHaveLength(4);
    expect(document.querySelector("#show-more-history")).toBeNull();

    document.querySelector<HTMLButtonElement>("#save")?.click();

    expect(
      document.querySelectorAll("[data-history-group=unpinned] li"),
    ).toHaveLength(3);
    expect(document.querySelector("#show-more-history")).not.toBeNull();
  });

  it("uses the Vite base URL for app and service-worker assets", async () => {
    const register = vi.fn();
    Object.defineProperty(navigator, "serviceWorker", {
      configurable: true,
      value: { register },
    });
    vi.stubEnv("BASE_URL", "/betterbuy/");

    await renderApp();

    expect(document.querySelector("header img")?.getAttribute("src")).toBe(
      "/betterbuy/icons/betterbuy-overlap.svg",
    );
    window.dispatchEvent(new Event("load"));
    expect(register).toHaveBeenCalledWith("/betterbuy/sw.js");
  });
});
