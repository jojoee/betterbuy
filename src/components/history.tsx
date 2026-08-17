import { formatNumber } from "../calculator";
import { PIN_LIMIT, type HistoryEntry } from "../history";

const focus =
  "focus-visible:outline-[3px] focus-visible:outline-bb-focus-ring focus-visible:outline-offset-2";
const button =
  "inline-flex min-h-12 items-center justify-center rounded-bb-lg px-4 py-2 font-bold disabled:cursor-not-allowed disabled:opacity-45";

export interface HistoryItemProps {
  entry: HistoryEntry;
  pinLimitReached: boolean;
  onRestore: (entry: HistoryEntry) => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  onDelete: (id: string) => void;
}

export function HistoryItem({
  entry,
  pinLimitReached,
  onRestore,
  onPin,
  onUnpin,
  onDelete,
}: HistoryItemProps) {
  const isPinned = Boolean(entry.pinnedAt);
  const winner = entry.result.winner
    ? `${entry.result.winner} is ${formatNumber(entry.result.savingPercent, 1)}% cheaper`
    : "Same cost per size";
  return (
    <li className="flex items-stretch gap-2 rounded-bb-lg border border-bb-border p-1">
      <button
        className={`min-h-11 min-w-0 flex-1 bg-transparent px-3 py-2 text-left text-bb-navy ${focus}`}
        aria-label="Restore saved comparison"
        onClick={() => onRestore(entry)}
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
          aria-label={`${isPinned ? "Unpin" : "Pin"} saved comparison`}
          disabled={!isPinned && pinLimitReached}
          aria-describedby={
            !isPinned && pinLimitReached ? "pin-limit" : undefined
          }
          onClick={() => (isPinned ? onUnpin(entry.id) : onPin(entry.id))}
        >
          {isPinned ? "Unpin" : "Pin"}
        </button>
        <button
          className={`${button} ${focus} bg-bb-danger-surface text-bb-danger`}
          aria-label="Delete saved comparison"
          onClick={() => onDelete(entry.id)}
        >
          Delete
        </button>
      </div>
    </li>
  );
}

export interface HistorySectionProps {
  history: HistoryEntry[];
  expanded: boolean;
  onRestore: (entry: HistoryEntry) => void;
  onPin: (id: string) => void;
  onUnpin: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleExpanded: () => void;
}

export function HistorySection({
  history,
  expanded,
  onRestore,
  onPin,
  onUnpin,
  onDelete,
  onToggleExpanded,
}: HistorySectionProps) {
  const pinned = history
    .filter((entry) => entry.pinnedAt)
    .sort((a, b) => (b.pinnedAt ?? "").localeCompare(a.pinnedAt ?? ""));
  const unpinned = history.filter((entry) => !entry.pinnedAt);
  const visible = expanded ? unpinned : unpinned.slice(0, 3);
  const pinLimitReached = pinned.length >= PIN_LIMIT;
  const itemProps = { pinLimitReached, onRestore, onPin, onUnpin, onDelete };
  return (
    <section
      className="mt-4 rounded-bb-2xl border border-bb-border bg-bb-surface p-5 shadow-bb-card"
      aria-labelledby="history-title"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="history-title" className="text-[1.05rem] font-bold">
          History
        </h2>
        <span className="inline-flex rounded-bb-sm bg-bb-info-surface px-2 py-1 text-sm font-bold text-bb-text-muted">
          {history.length}/50
        </span>
      </div>
      {!history.length ? (
        <p className="mt-2 grid gap-2 py-4 text-center text-bb-text-muted">
          No saved comparisons yet.
        </p>
      ) : (
        <>
          {pinned.length > 0 && (
            <section className="mt-4">
              <h3 className="font-bold">Pinned ({pinned.length})</h3>
              <ul className="mt-2 grid list-none gap-2 p-0">
                {pinned.map((entry) => (
                  <HistoryItem key={entry.id} entry={entry} {...itemProps} />
                ))}
              </ul>
            </section>
          )}
          {pinLimitReached && (
            <p
              id="pin-limit"
              className="mt-3 text-[0.82rem] text-bb-text-muted"
            >
              Unpin a saved comparison to pin another.
            </p>
          )}
          {visible.length > 0 && (
            <ul className="mt-2 grid list-none gap-2 p-0">
              {visible.map((entry) => (
                <HistoryItem key={entry.id} entry={entry} {...itemProps} />
              ))}
            </ul>
          )}
          {unpinned.length > 3 && (
            <button
              className={`${button} ${focus} mt-4 w-full border border-bb-border-input bg-bb-surface text-bb-navy transition-colors hover:border-bb-focus motion-reduce:transition-none`}
              onClick={onToggleExpanded}
            >
              {expanded ? "Show less" : "Show more"}
            </button>
          )}
        </>
      )}
    </section>
  );
}
