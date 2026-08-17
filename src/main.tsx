import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./tailwind.css";
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
const focus =
  "focus-visible:outline-[3px] focus-visible:outline-bb-focus-ring focus-visible:outline-offset-2";
const button =
  "inline-flex min-h-12 items-center justify-center rounded-bb-lg px-4 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-45";

function displayValue(value: number): string {
  return Number.isFinite(value) ? String(value) : "";
}

function ComparisonResult({ values }: { values: ComparisonInput }) {
  const result = compare(values);
  if (!result)
    return (
      <p
        className="mt-4 grid min-h-17 gap-1 rounded-bb-xl bg-bb-info-surface p-3 text-bb-text-muted"
        aria-live="polite"
      >
        Enter positive Cost and Size values to compare.
      </p>
    );
  const headline = result.winner
    ? `${result.winner} is ${formatNumber(result.savingPercent, 1)}% cheaper`
    : "A and B cost the same per size";
  return (
    <div
      className={`mt-4 grid min-h-17 gap-1 rounded-bb-xl p-3 ${
        result.winner
          ? "bg-bb-success-surface text-bb-success"
          : "bg-bb-info-surface text-bb-text-muted"
      }`}
      aria-live="polite"
    >
      <strong className="text-lg">{headline}</strong>
      <span className="text-sm">
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
      <label className="mt-2 grid grid-cols-[3.375rem_1fr] items-center gap-2 text-bb-text-muted">
        <span>{kind}</span>
        <input
          className={`min-w-0 w-full rounded-bb-md border border-bb-border-input bg-bb-surface p-3 font-semibold text-bb-navy transition-[background-color,border-color,color,box-shadow] focus:border-bb-focus disabled:cursor-not-allowed disabled:bg-bb-info-surface disabled:text-bb-text-subtle motion-reduce:transition-none ${focus}`}
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
    <section
      className="rounded-bb-2xl border border-bb-border bg-bb-surface p-5 shadow-bb-card"
      aria-labelledby="compare-title"
    >
      <h2 id="compare-title" className="text-[1.05rem] font-bold">
        Compare by cost per size
      </h2>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <fieldset className="m-0 rounded-bb-xl border border-bb-border-strong p-3 focus-within:border-bb-focus">
          <legend className="px-2 font-bold">Option A</legend>
          {field("A", "Cost")}
          {field("A", "Size")}
        </fieldset>
        <fieldset className="m-0 rounded-bb-xl border border-bb-border-strong p-3 focus-within:border-bb-focus">
          <legend className="px-2 font-bold">Option B</legend>
          {field("B", "Cost")}
          {field("B", "Size")}
        </fieldset>
      </div>
      <ComparisonResult values={values} />
      <button
        id="save"
        className={`${button} ${focus} mt-4 w-full bg-bb-navy text-white transition-colors hover:bg-bb-navy-hover motion-reduce:transition-none`}
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
    <li
      className="flex items-stretch gap-2 rounded-bb-lg border border-bb-border p-1"
      data-history-id={entry.id}
    >
      <button
        className={`min-h-11 min-w-0 flex-1 bg-transparent px-3 py-2 text-left text-bb-navy ${focus}`}
        data-restore={entry.id}
        aria-label="Restore saved comparison"
        onClick={() => {
          dispatch({ type: "history/restore", input: entry.input });
          window.scrollTo({ top: 0, behavior: "smooth" });
        }}
      >
        <span className="block overflow-hidden text-ellipsis whitespace-nowrap">
          A {formatNumber(entry.input.costA)} /{" "}
          {formatNumber(entry.input.sizeA)} · B{" "}
          {formatNumber(entry.input.costB)} / {formatNumber(entry.input.sizeB)}
        </span>
        <small className="mt-[0.1875rem] block overflow-hidden text-ellipsis whitespace-nowrap text-bb-success-action">
          {winner}
        </small>
      </button>
      <div className="grid grid-cols-2 gap-1">
        <button
          className={`${button} ${focus} bg-bb-success-action-surface text-bb-success-action`}
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
          className={`${button} ${focus} bg-bb-danger-surface text-bb-danger`}
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
    <section
      className="mt-4 rounded-bb-2xl border border-bb-border bg-bb-surface p-5 shadow-bb-card"
      aria-labelledby="history-title"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="history-title" className="text-[1.05rem] font-bold">
          History
        </h2>
        <span
          id="history-count"
          className="inline-flex rounded-bb-sm bg-bb-info-surface px-2 py-1 text-sm font-bold text-bb-text-muted"
        >
          {history.length}/50
        </span>
      </div>
      <div id="history-content">
        {!history.length ? (
          <p className="mt-2 grid gap-2 py-4 text-center text-bb-text-muted">
            No saved comparisons yet.
          </p>
        ) : (
          <>
            {pinned.length > 0 && (
              <section className="mt-4">
                <h3 className="font-bold">Pinned ({pinned.length})</h3>
                <ul
                  className="mt-2 grid list-none gap-2 p-0"
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
              <p
                id="pin-limit"
                className="mt-3 text-[0.82rem] text-bb-text-subtle"
              >
                Unpin a saved comparison to pin another.
              </p>
            )}
            {visible.length > 0 && (
              <ul
                className="mt-2 grid list-none gap-2 p-0"
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
                className={`${button} ${focus} mt-4 w-full border border-bb-border-input bg-bb-surface text-bb-navy transition-colors hover:border-bb-focus motion-reduce:transition-none`}
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
    <main className="min-h-screen min-w-80 bg-bb-page px-5 pt-[max(1rem,env(safe-area-inset-top))] pb-[calc(2.5rem+env(safe-area-inset-bottom))] font-sans text-bb-navy">
      <div className="mx-auto w-full max-w-[38.75rem]">
        <header className="mb-4 flex min-h-11 items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <img
              className="size-10 rounded-bb-lg"
              src={`${baseUrl}icons/betterbuy-overlap.svg`}
              alt=""
            />
            <h1 className="text-xl font-bold tracking-[-0.025em]">
              Betterbuy{" "}
              <span className="text-sm font-medium tracking-normal text-bb-text-muted">
                · Find the better deal
              </span>
            </h1>
          </div>
        </header>
        <ComparisonForm />
        <HistorySection />
      </div>
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
