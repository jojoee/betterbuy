import { useRef, useState } from "react";
import { createRoot } from "react-dom/client";
import "./demo.css";

export function DemoOverlays() {
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const open = () => dialogRef.current?.showModal();
  const close = () => dialogRef.current?.close();
  return (
    <>
      <div className="ds-cluster demo-overlays">
        <span className="demo-tooltip-wrap">
          <button
            className="ds-button ds-button--secondary"
            aria-describedby="demo-tooltip"
            onMouseEnter={() => setTooltipVisible(true)}
            onMouseLeave={() => setTooltipVisible(false)}
            onFocus={() => setTooltipVisible(true)}
            onBlur={() => setTooltipVisible(false)}
          >
            Why local?
            <svg className="ds-icon" aria-hidden="true" viewBox="0 0 24 24">
              <circle cx="12" cy="12" r="9" />
              <path d="M12 10v6m0-9h.01" />
            </svg>
          </button>
          <span
            className="ds-tooltip"
            id="demo-tooltip"
            role="tooltip"
            hidden={!tooltipVisible}
          >
            Saved comparisons stay in this browser.
          </span>
        </span>
        <button className="ds-button ds-button--primary" onClick={open}>
          Open dialog
        </button>
      </div>
      <dialog
        className="ds-dialog"
        ref={dialogRef}
        aria-labelledby="demo-dialog-title"
        onCancel={(event) => {
          event.preventDefault();
          close();
        }}
      >
        <div className="ds-stack">
          <h3 id="demo-dialog-title">Example dialog</h3>
          <p>
            Use a dialog only when the user must make a decision before
            returning to the page.
          </p>
          <div className="ds-button-group">
            <button className="ds-button ds-button--secondary" onClick={close}>
              Cancel
            </button>
            <button className="ds-button ds-button--primary" onClick={close}>
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
