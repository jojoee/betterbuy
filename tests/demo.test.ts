import { afterEach, describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { initializeDemo } from "../src/demo";

function renderDemo(): HTMLElement {
  const root = document.createElement("div");
  root.innerHTML = `<button data-demo-tooltip-trigger></button><span data-demo-tooltip hidden></span><button data-demo-popover-trigger aria-expanded="false"></button><div data-demo-popover hidden></div><button data-demo-popover-close></button><button data-demo-dialog-open></button><dialog data-demo-dialog></dialog><button data-demo-dialog-close></button>`;
  document.body.append(root);
  const dialog = root.querySelector<HTMLDialogElement>("[data-demo-dialog]");
  if (!dialog) throw new Error("Dialog fixture not found");
  Object.defineProperty(dialog, "showModal", {
    value: () => dialog.setAttribute("open", ""),
  });
  Object.defineProperty(dialog, "close", {
    value: () => dialog.removeAttribute("open"),
  });
  initializeDemo(root);
  return root;
}

describe("design-system catalog interactions", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  it("reveals a tooltip for pointer and keyboard users", () => {
    const root = renderDemo();
    const trigger = root.querySelector<HTMLButtonElement>(
      "[data-demo-tooltip-trigger]",
    )!;
    const tooltip = root.querySelector<HTMLElement>("[data-demo-tooltip]")!;

    trigger.dispatchEvent(new Event("focus"));
    expect(tooltip.hidden).toBe(false);
    trigger.dispatchEvent(new Event("blur"));
    expect(tooltip.hidden).toBe(true);
  });

  it("opens and closes the catalog dialog with Escape", () => {
    const root = renderDemo();
    const dialog = root.querySelector<HTMLDialogElement>("[data-demo-dialog]")!;

    root.querySelector<HTMLButtonElement>("[data-demo-dialog-open]")!.click();
    expect(dialog.open).toBe(true);
    root.querySelector<HTMLButtonElement>("[data-demo-dialog-open]")!.click();
    expect(dialog.open).toBe(true);
    root.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(dialog.open).toBe(false);
  });

  it("documents labelled, invalid, disabled, and keyboard-focusable form contracts", async () => {
    const [markup, css] = await Promise.all([
      readFile(join(process.cwd(), "demo.html"), "utf8"),
      readFile(join(process.cwd(), "src/design-system.css"), "utf8"),
    ]);

    expect(markup).toContain('for="demo-cost"');
    expect(markup).toContain('aria-describedby="demo-cost-error"');
    expect(markup).toContain('aria-invalid="true"');
    expect(markup).toContain('id="demo-disabled"');
    expect(markup).toContain('type="checkbox" disabled');
    expect(markup).toContain('type="radio" disabled');
    expect(css).toContain(".ds-input:disabled,");
    expect(css).toContain(".ds-input:focus-visible,");
  });
});
