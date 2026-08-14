import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

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
    expect(document.body.textContent).toContain("1/100");
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
});
