import "@testing-library/jest-dom/vitest";
import { afterEach, describe, expect, it } from "vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { DemoOverlays } from "../src/demo";

describe("design-system catalog interactions", () => {
  afterEach(cleanup);
  it("reveals a tooltip for pointer and keyboard users", () => {
    render(<DemoOverlays />);
    const trigger = screen.getByRole("button", { name: "Why local?" });
    fireEvent.focus(trigger);
    expect(screen.getByRole("tooltip")).toBeVisible();
    fireEvent.blur(trigger);
    expect(screen.queryByRole("tooltip")).toBeNull();
  });

  it("opens and closes the catalog dialog", () => {
    Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.setAttribute("open", "");
      },
    });
    Object.defineProperty(HTMLDialogElement.prototype, "close", {
      configurable: true,
      value: function (this: HTMLDialogElement) {
        this.removeAttribute("open");
      },
    });
    render(<DemoOverlays />);
    fireEvent.click(screen.getByRole("button", { name: "Open dialog" }));
    const dialog = document.querySelector("dialog");
    expect(dialog).toHaveAttribute("open");
    fireEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(dialog).not.toHaveAttribute("open");
  });
});
