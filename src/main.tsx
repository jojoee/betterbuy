import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import "./tailwind.css";
import { ComparisonForm } from "./components/comparison";
import { HistorySection } from "./components/history";
import {
  betterbuyStore,
  deleteHistoryEntry,
  dispatch,
  pinHistoryEntry,
  saveCurrentComparison,
  type BetterbuyStore,
  unpinHistoryEntry,
  useBetterbuyStore,
} from "./store";

const baseUrl = import.meta.env.BASE_URL;

export function App({ store = betterbuyStore }: { store?: BetterbuyStore }) {
  const values = useBetterbuyStore((state) => state.values, store);
  const history = useBetterbuyStore((state) => state.history, store);
  const expanded = useBetterbuyStore((state) => state.isHistoryExpanded, store);

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
        <ComparisonForm
          values={values}
          onSetField={(field, value) =>
            dispatch({ type: "comparison/setField", field, value }, store)
          }
          onSave={() => saveCurrentComparison(store)}
        />
        <HistorySection
          history={history}
          expanded={expanded}
          onRestore={(entry) => {
            dispatch({ type: "history/restore", input: entry.input }, store);
            window.scrollTo({ top: 0, behavior: "smooth" });
          }}
          onPin={(id) => pinHistoryEntry(id, store)}
          onUnpin={(id) => unpinHistoryEntry(id, store)}
          onDelete={(id) => deleteHistoryEntry(id, store)}
          onToggleExpanded={() =>
            dispatch({ type: "history/toggleExpanded" }, store)
          }
        />
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
