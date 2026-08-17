import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./tailwind.css";

export function DemoOverlays() {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();
  return (
    <>
      <div className="flex flex-wrap items-start gap-2">
        <span className="relative">
          <button
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-bb-lg border border-bb-border-input bg-bb-surface px-4 py-2 font-bold text-bb-navy focus-visible:outline-[3px] focus-visible:outline-bb-focus-ring focus-visible:outline-offset-2"
            aria-describedby="demo-tooltip"
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
            onFocus={() => setTooltipVisible(true)}
            onBlur={() => setTooltipVisible(false)}
          >
            Why local?
            <svg
              className="size-5 fill-none stroke-current stroke-2 [stroke-linecap:round] [stroke-linejoin:round]"
              aria-hidden="true"
              viewBox="0 0 24 24"
            >
              <circle cx="12" cy="12" r="9" />
              <path d="M12 10v6m0-9h.01" />
            </svg>
          </button>
          <span
            className="absolute top-[calc(100%+0.5rem)] left-0 z-10 max-w-72 rounded-bb-sm bg-bb-navy p-2 text-sm text-white"
            id="demo-tooltip"
            role="tooltip"
            hidden={!tooltipVisible}
          >
            Saved comparisons stay in this browser.
          </span>
        </span>
        <button
          className="inline-flex min-h-12 items-center justify-center rounded-bb-lg bg-bb-navy px-4 py-2 font-bold text-white focus-visible:outline-[3px] focus-visible:outline-bb-focus-ring focus-visible:outline-offset-2"
          onClick={open}
        >
          Open dialog
        </button>
      </div>
      <dialog
        className="max-w-[min(24rem,calc(100vw-2rem))] rounded-bb-xl border border-bb-border-strong bg-bb-surface p-4 text-bb-navy shadow-bb-card backdrop:bg-bb-navy/40"
        ref={dialogRef}
        aria-labelledby="demo-dialog-title"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
      >
        <div className="grid gap-3">
          <h3 id="demo-dialog-title">Example dialog</h3>
          <p>
            Use a dialog only when the user must make a decision before
            returning to the page.
          </p>
          <div className="flex flex-wrap items-center gap-2">
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-bb-lg border border-bb-border-input bg-bb-surface px-4 py-2 font-bold focus-visible:outline-[3px] focus-visible:outline-bb-focus-ring focus-visible:outline-offset-2"
              onClick={close}
            >
              Cancel
            </button>
            <button
              className="inline-flex min-h-12 items-center justify-center rounded-bb-lg bg-bb-navy px-4 py-2 font-bold text-white focus-visible:outline-[3px] focus-visible:outline-bb-focus-ring focus-visible:outline-offset-2"
              onClick={close}
            >
              Done
            </button>
          </div>
        </div>
      </dialog>
    </>
  );
}

const root = document.querySelector<HTMLDivElement>("#demo-overlays-root");
if (root) createRoot(root).render(<DemoOverlays />);
