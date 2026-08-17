import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { useRegisterSW } from "virtual:pwa-register/react";
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

  const { needRefresh, updateServiceWorker } = useRegisterSW();

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
        {needRefresh[0] && (
          <aside
            className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-bb-xl border border-bb-warning-border bg-bb-warning-surface p-3 text-bb-warning"
            role="status"
          >
            <p className="text-sm font-medium">
              A new version of Betterbuy is ready.
            </p>
            <button
              className="min-h-11 rounded-bb-lg bg-bb-navy px-4 py-2 font-bold text-white transition-colors hover:bg-bb-navy-hover focus-visible:outline-[3px] focus-visible:outline-bb-focus-ring focus-visible:outline-offset-2 motion-reduce:transition-none"
              onClick={() => void updateServiceWorker(true)}
              type="button"
            >
              Update now
            </button>
          </aside>
        )}
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
