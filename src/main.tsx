import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./style.css";
import { compare, formatNumber, type ComparisonInput } from "./calculator";
import { PIN_LIMIT, type HistoryEntry } from "./history";
import {
  deleteHistoryEntry,
  dispatch,
  pinHistoryEntry,
  saveCurrentComparison,
  unpinHistoryEntry,
  useBetterbuyStore,
} from "./store";

const baseUrl = import.meta.env.BASE_URL;

function displayValue(value: number): string {
  return Number.isFinite(value) ? String(value) : "";
}

function ComparisonResult({ values }: { values: ComparisonInput }) {
  const result = compare(values);
  if (!result)
    return (
      <p className="ds-alert result-placeholder" aria-live="polite">
        Enter positive Cost and Size values to compare.
      </p>
    );
  const headline = result.winner
    ? `${result.winner} is ${formatNumber(result.savingPercent, 1)}% cheaper`
    : "A and B cost the same per size";
  return (
    <div
      className={`ds-alert result${result.winner ? " ds-alert--success" : ""}`}
      aria-live="polite"
    >
      <strong>{headline}</strong>
      <span>
        A: {formatNumber(result.unitCostA)} per size · B:{" "}
        {formatNumber(result.unitCostB)} per size
      </span>
    </div>
  );
}

function ComparisonForm() {
  const values = useBetterbuyStore((state) => state.values);
  const valid = Boolean(compare(values));
  const field = (option: "A" | "B", kind: "Cost" | "Size") => {
    const key = `${kind.toLowerCase()}${option}` as keyof ComparisonInput;
    return (
      <label className="ds-field">
        <span>{kind}</span>
        <input
          className="ds-input"
          data-key={key}
          aria-label={`${option} ${kind}`}
          type="number"
          inputMode="decimal"
          min="0"
          step="any"
          placeholder="0"
          value={displayValue(values[key])}
          onChange={(event) =>
            dispatch({
              type: "comparison/setField",
              field: key,
              value: event.currentTarget.valueAsNumber,
            })
          }
        />
      </label>
    );
  };
  return (
    <section className="ds-card calculator" aria-labelledby="compare-title">
      <div className="ds-section-header">
        <h2 id="compare-title">Compare by cost per size</h2>
      </div>
      <div className="row g-3 options">
        <div className="col-12 col-sm-6">
          <fieldset className="ds-fieldset">
            <legend>Option A</legend>
            {field("A", "Cost")}
            {field("A", "Size")}
          </fieldset>
        </div>
        <div className="col-12 col-sm-6">
          <fieldset className="ds-fieldset">
            <legend>Option B</legend>
            {field("B", "Cost")}
            {field("B", "Size")}
          </fieldset>
        </div>
      </div>
      <ComparisonResult values={values} />
      <button
        id="save"
        className="ds-button ds-button--primary ds-button--block save"
        disabled={!valid}
        onClick={saveCurrentComparison}
      >
        Save into history
      </button>
    </section>
  );
}

function HistoryItem({
  entry,
  pinLimitReached,
}: {
  entry: HistoryEntry;
  pinLimitReached: boolean;
}) {
  const isPinned = Boolean(entry.pinnedAt);
  const winner = entry.result.winner
    ? `${entry.result.winner} is ${formatNumber(entry.result.savingPercent, 1)}% cheaper`
    : "Same cost per size";
  return (
    <li className="ds-list-item" data-history-id={entry.id}>
      <button
        className="ds-list-item__restore history-restore"
        data-restore={entry.id}
        aria-label="Restore saved comparison"
        onClick={() => {
          dispatch({ type: "history/restore", input: entry.input });
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <span>
          A {formatNumber(entry.input.costA)} /{" "}
          {formatNumber(entry.input.sizeA)} · B{" "}
          {formatNumber(entry.input.costB)} / {formatNumber(entry.input.sizeB)}
        </span>
        <small>{winner}</small>
      </button>
      <div className="ds-list-item__actions">
        <button
          className="ds-button ds-button--subtle-success"
          data-pin={entry.id}
          aria-label={`${isPinned ? "Unpin" : "Pin"} saved comparison`}
          disabled={!isPinned && pinLimitReached}
          aria-describedby={
            !isPinned && pinLimitReached ? "pin-limit" : undefined
          }
          onClick={() =>
            isPinned ? unpinHistoryEntry(entry.id) : pinHistoryEntry(entry.id)
          }
        >
          {isPinned ? "Unpin" : "Pin"}
        </button>
        <button
          className="ds-button ds-button--subtle-danger"
          data-delete={entry.id}
          aria-label="Delete saved comparison"
          onClick={() => deleteHistoryEntry(entry.id)}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

function HistorySection() {
  const history = useBetterbuyStore((state) => state.history);
  const expanded = useBetterbuyStore((state) => state.isHistoryExpanded);
  const pinned = history
    .filter((entry) => entry.pinnedAt)
    .sort((a, b) => (b.pinnedAt ?? "").localeCompare(a.pinnedAt ?? ""));
  const unpinned = history.filter((entry) => !entry.pinnedAt);
  const visible = expanded ? unpinned : unpinned.slice(0, 3);
  const pinLimitReached = pinned.length >= PIN_LIMIT;
  return (
    <section className="ds-card history" aria-labelledby="history-title">
      <div className="ds-section-header history-title">
        <h2 id="history-title">History</h2>
        <span id="history-count" className="ds-badge ds-badge--neutral">
          {history.length}/50
        </span>
      </div>
      <div id="history-content">
        {!history.length ? (
          <p className="ds-empty-state empty-history">
            No saved comparisons yet.
          </p>
        ) : (
          <>
            {pinned.length > 0 && (
              <section className="history-group">
                <div className="history-group-title">
                  <h3>Pinned ({pinned.length})</h3>
                </div>
                <ul
                  className="ds-list history-list"
                  data-history-group="pinned"
                >
                  {pinned.map((entry) => (
                    <HistoryItem
                      key={entry.id}
                      entry={entry}
                      pinLimitReached={pinLimitReached}
                    />
                  ))}
                </ul>
              </section>
            )}
            {pinLimitReached && (
              <p id="pin-limit" className="pin-limit">
                Unpin a saved comparison to pin another.
              </p>
            )}
            {visible.length > 0 && (
              <ul
                className="ds-list history-list"
                data-history-group="unpinned"
              >
                {visible.map((entry) => (
                  <HistoryItem
                    key={entry.id}
                    entry={entry}
                    pinLimitReached={pinLimitReached}
                  />
                ))}
              </ul>
            )}
            {unpinned.length > 3 && (
              <button
                id="show-more-history"
                className="ds-button ds-button--secondary ds-button--block show-more"
                onClick={() => dispatch({ type: "history/toggleExpanded" })}
              >
                {expanded ? "Show less" : "Show more"}
              </button>
            )}
          </>
        )}
      </div>
    </section>
  );
}

export function App() {
  useEffect(() => {
    if ("serviceWorker" in navigator)
      window.addEventListener("load", () =>
        navigator.serviceWorker.register(`${baseUrl}sw.js`),
      );
  }, []);
  return (
    <main className="container app-shell">
      <header className="ds-page-header">
        <div className="ds-page-header__identity">
          <img src={`${baseUrl}icons/betterbuy-overlap.svg`} alt="" />
          <h1>
            Betterbuy <span>· Find the better deal</span>
          </h1>
        </div>
      </header>
      <ComparisonForm />
      <HistorySection />
    </main>
  );
}

const root = document.querySelector<HTMLDivElement>("#app");
if (root)
  createRoot(root).render(
    <StrictMode>
      <App />
    </StrictMode>,
  );
