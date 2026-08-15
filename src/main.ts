import "./style.css";
import {
  compare,
  formatNumber,
  type ComparisonInput,
  type ComparisonResult,
} from "./calculator";
import {
  PIN_LIMIT,
  deleteHistory,
  pinHistory,
  readHistory,
  saveHistory,
  unpinHistory,
  type HistoryEntry,
} from "./history";

const baseUrl = import.meta.env.BASE_URL;
const emptyInput: ComparisonInput = {
  costA: NaN,
  sizeA: NaN,
  costB: NaN,
  sizeB: NaN,
};
let values = { ...emptyInput };
let history = readHistory();
let visibleUnpinnedCount = 2;

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) throw new Error("App root not found");
const app = appRoot;

function inputField(
  label: "Cost" | "Size",
  option: "A" | "B",
  key: keyof ComparisonInput,
): string {
  return `<label><span>${label}</span><input data-key="${key}" aria-label="${option} ${label}" type="number" inputmode="decimal" min="0" step="any" placeholder="0" /></label>`;
}

function resultMarkup(result: ComparisonResult | null): string {
  if (!result)
    return '<p class="result-placeholder" aria-live="polite">Enter positive Cost and Size values to compare.</p>';
  const headline = result.winner
    ? `${result.winner} is ${formatNumber(result.savingPercent, 1)}% cheaper`
    : "A and B cost the same per size";
  return `<div class="result ${result.winner ? "has-winner" : ""}" aria-live="polite"><strong>${headline}</strong><span>A: ${formatNumber(result.unitCostA)} per size · B: ${formatNumber(result.unitCostB)} per size</span></div>`;
}

function historyItemMarkup(
  entry: HistoryEntry,
  pinLimitReached: boolean,
): string {
  const winner = entry.result.winner
    ? `${entry.result.winner} is ${formatNumber(entry.result.savingPercent, 1)}% cheaper`
    : "Same cost per size";
  const isPinned = Boolean(entry.pinnedAt);
  return `<li data-history-id="${entry.id}"><button class="history-restore" data-restore="${entry.id}" aria-label="Restore saved comparison"><span>A ${formatNumber(entry.input.costA)} / ${formatNumber(entry.input.sizeA)} · B ${formatNumber(entry.input.costB)} / ${formatNumber(entry.input.sizeB)}</span><small>${winner}</small></button><div class="history-actions"><button class="pin" data-pin="${entry.id}" aria-label="${isPinned ? "Unpin" : "Pin"} saved comparison" ${!isPinned && pinLimitReached ? 'disabled aria-describedby="pin-limit"' : ""}>${isPinned ? "Unpin" : "Pin"}</button><button class="delete" data-delete="${entry.id}" aria-label="Delete saved comparison">Delete</button></div></li>`;
}

function historyListMarkup(
  entries: HistoryEntry[],
  group: "pinned" | "unpinned",
  pinLimitReached: boolean,
): string {
  return `<ul class="history-list" data-history-group="${group}">${entries
    .map((entry) => historyItemMarkup(entry, pinLimitReached))
    .join("")}</ul>`;
}

function historyMarkup(): string {
  if (!history.length)
    return '<p class="empty-history">No saved comparisons yet.</p>';
  const pinned = history
    .filter((entry) => entry.pinnedAt)
    .sort((a, b) => (b.pinnedAt ?? "").localeCompare(a.pinnedAt ?? ""));
  const unpinned = history.filter((entry) => !entry.pinnedAt);
  const visibleUnpinned = unpinned.slice(0, visibleUnpinnedCount);
  const remainingCount = unpinned.length - visibleUnpinned.length;
  const pinLimitReached = pinned.length >= PIN_LIMIT;
  return `${pinned.length ? `<section class="history-group"><div class="history-group-title"><h3>Pinned</h3><span>${pinned.length}/${PIN_LIMIT}</span></div>${historyListMarkup(pinned, "pinned", pinLimitReached)}</section>` : ""}${pinLimitReached ? `<p id="pin-limit" class="pin-limit">Unpin a saved comparison to pin another.</p>` : ""}${visibleUnpinned.length ? historyListMarkup(visibleUnpinned, "unpinned", pinLimitReached) : ""}${remainingCount ? `<button id="show-more-history" class="show-more">Show ${Math.min(2, remainingCount)} more</button>` : ""}`;
}

function render(): void {
  const result = compare(values);
  app.innerHTML = `<main><header><img src="${baseUrl}icons/betterbuy-overlap.svg" alt="" /><h1>Betterbuy <span>· Find the better deal</span></h1></header><section class="calculator" aria-labelledby="compare-title"><h2 id="compare-title">Compare by cost per size</h2><div class="options"><fieldset><legend>Option A</legend>${inputField("Cost", "A", "costA")}${inputField("Size", "A", "sizeA")}</fieldset><fieldset><legend>Option B</legend>${inputField("Cost", "B", "costB")}${inputField("Size", "B", "sizeB")}</fieldset></div>${resultMarkup(result)}<button id="save" class="save" ${result ? "" : "disabled"}>Save into history</button></section><section class="history" aria-labelledby="history-title"><div class="history-title"><h2 id="history-title">History</h2><span>${history.length}/50</span></div>${historyMarkup()}</section></main>`;
  for (const input of document.querySelectorAll<HTMLInputElement>(
    "[data-key]",
  )) {
    const key = input.dataset.key as keyof ComparisonInput;
    input.value = Number.isFinite(values[key]) ? String(values[key]) : "";
    input.addEventListener("input", () => {
      values[key] = input.valueAsNumber;
      render();
    });
  }
  document
    .querySelector<HTMLButtonElement>("#save")
    ?.addEventListener("click", () => {
      const savedResult = compare(values);
      if (!savedResult) return;
      history = saveHistory({
        id: crypto.randomUUID(),
        input: { ...values },
        result: savedResult,
        savedAt: new Date().toISOString(),
      });
      visibleUnpinnedCount = 2;
      render();
    });
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-delete]",
  ))
    button.addEventListener("click", () => {
      history = deleteHistory(button.dataset.delete ?? "");
      render();
    });
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-pin]",
  ))
    button.addEventListener("click", () => {
      const entry = history.find((item) => item.id === button.dataset.pin);
      if (!entry) return;
      history = entry.pinnedAt ? unpinHistory(entry.id) : pinHistory(entry.id);
      render();
    });
  document
    .querySelector<HTMLButtonElement>("#show-more-history")
    ?.addEventListener("click", () => {
      visibleUnpinnedCount += 2;
      render();
    });
  for (const button of document.querySelectorAll<HTMLButtonElement>(
    "[data-restore]",
  ))
    button.addEventListener("click", () => {
      const entry = history.find((item) => item.id === button.dataset.restore);
      if (entry) {
        values = { ...entry.input };
        render();
        window.scrollTo({ top: 0, behavior: "smooth" });
      }
    });
}

if ("serviceWorker" in navigator)
  window.addEventListener("load", () =>
    navigator.serviceWorker.register(`${baseUrl}sw.js`),
  );
render();
