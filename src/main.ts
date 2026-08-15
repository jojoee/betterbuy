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
let isHistoryExpanded = false;

const appRoot = document.querySelector<HTMLDivElement>("#app");
if (!appRoot) throw new Error("App root not found");
const app = appRoot;

function inputField(
  label: "Cost" | "Size",
  option: "A" | "B",
  key: keyof ComparisonInput,
): string {
  return `<label class="ds-field"><span>${label}</span><input class="ds-input" data-key="${key}" aria-label="${option} ${label}" type="number" inputmode="decimal" min="0" step="any" placeholder="0" /></label>`;
}

function resultMarkup(result: ComparisonResult | null): string {
  if (!result)
    return '<p class="ds-alert result-placeholder" aria-live="polite">Enter positive Cost and Size values to compare.</p>';
  const headline = result.winner
    ? `${result.winner} is ${formatNumber(result.savingPercent, 1)}% cheaper`
    : "A and B cost the same per size";
  return `<div class="ds-alert result ${result.winner ? "ds-alert--success" : ""}" aria-live="polite"><strong>${headline}</strong><span>A: ${formatNumber(result.unitCostA)} per size · B: ${formatNumber(result.unitCostB)} per size</span></div>`;
}

function historyItemMarkup(
  entry: HistoryEntry,
  pinLimitReached: boolean,
): string {
  const winner = entry.result.winner
    ? `${entry.result.winner} is ${formatNumber(entry.result.savingPercent, 1)}% cheaper`
    : "Same cost per size";
  const isPinned = Boolean(entry.pinnedAt);
  return `<li class="ds-list-item" data-history-id="${entry.id}"><button class="ds-list-item__restore history-restore" data-restore="${entry.id}" aria-label="Restore saved comparison"><span>A ${formatNumber(entry.input.costA)} / ${formatNumber(entry.input.sizeA)} · B ${formatNumber(entry.input.costB)} / ${formatNumber(entry.input.sizeB)}</span><small>${winner}</small></button><div class="ds-list-item__actions"><button class="ds-button ds-button--subtle-success" data-pin="${entry.id}" aria-label="${isPinned ? "Unpin" : "Pin"} saved comparison" ${!isPinned && pinLimitReached ? 'disabled aria-describedby="pin-limit"' : ""}>${isPinned ? "Unpin" : "Pin"}</button><button class="ds-button ds-button--subtle-danger" data-delete="${entry.id}" aria-label="Delete saved comparison">Delete</button></div></li>`;
}

function historyListMarkup(
  entries: HistoryEntry[],
  group: "pinned" | "unpinned",
  pinLimitReached: boolean,
): string {
  return `<ul class="ds-list history-list" data-history-group="${group}">${entries
    .map((entry) => historyItemMarkup(entry, pinLimitReached))
    .join("")}</ul>`;
}

function historyMarkup(): string {
  if (!history.length)
    return '<p class="ds-empty-state empty-history">No saved comparisons yet.</p>';
  const pinned = history
    .filter((entry) => entry.pinnedAt)
    .sort((a, b) => (b.pinnedAt ?? "").localeCompare(a.pinnedAt ?? ""));
  const unpinned = history.filter((entry) => !entry.pinnedAt);
  const visibleUnpinned = isHistoryExpanded ? unpinned : unpinned.slice(0, 3);
  const canToggleUnpinned = unpinned.length > 3;
  const pinLimitReached = pinned.length >= PIN_LIMIT;
  return `${pinned.length ? `<section class="history-group"><div class="history-group-title"><h3>Pinned (${pinned.length})</h3></div>${historyListMarkup(pinned, "pinned", pinLimitReached)}</section>` : ""}${pinLimitReached ? `<p id="pin-limit" class="pin-limit">Unpin a saved comparison to pin another.</p>` : ""}${visibleUnpinned.length ? historyListMarkup(visibleUnpinned, "unpinned", pinLimitReached) : ""}${canToggleUnpinned ? `<button id="show-more-history" class="ds-button ds-button--secondary ds-button--block show-more">${isHistoryExpanded ? "Show less" : "Show more"}</button>` : ""}`;
}

function renderComparison(): void {
  const result = compare(values);
  const resultContainer =
    document.querySelector<HTMLDivElement>("#comparison-result");
  const saveButton = document.querySelector<HTMLButtonElement>("#save");
  if (!resultContainer || !saveButton)
    throw new Error("Comparison controls not found");
  resultContainer.innerHTML = resultMarkup(result);
  saveButton.disabled = !result;
}

function render(): void {
  const result = compare(values);
  app.innerHTML = `<main class="container app-shell"><header class="ds-page-header"><div class="ds-page-header__identity"><img src="${baseUrl}icons/betterbuy-overlap.svg" alt="" /><h1>Betterbuy <span>· Find the better deal</span></h1></div></header><section class="ds-card calculator" aria-labelledby="compare-title"><div class="ds-section-header"><h2 id="compare-title">Compare by cost per size</h2></div><div class="row g-3 options"><div class="col-12 col-sm-6"><fieldset class="ds-fieldset"><legend>Option A</legend>${inputField("Cost", "A", "costA")}${inputField("Size", "A", "sizeA")}</fieldset></div><div class="col-12 col-sm-6"><fieldset class="ds-fieldset"><legend>Option B</legend>${inputField("Cost", "B", "costB")}${inputField("Size", "B", "sizeB")}</fieldset></div></div><div id="comparison-result">${resultMarkup(result)}</div><button id="save" class="ds-button ds-button--primary ds-button--block save" ${result ? "" : "disabled"}>Save into history</button></section><section class="ds-card history" aria-labelledby="history-title"><div class="ds-section-header history-title"><h2 id="history-title">History</h2><span class="ds-badge ds-badge--neutral">${history.length}/50</span></div>${historyMarkup()}</section></main>`;
  for (const input of document.querySelectorAll<HTMLInputElement>(
    "[data-key]",
  )) {
    const key = input.dataset.key as keyof ComparisonInput;
    input.value = Number.isFinite(values[key]) ? String(values[key]) : "";
    input.addEventListener("input", () => {
      values[key] = input.valueAsNumber;
      renderComparison();
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
      isHistoryExpanded = false;
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
      isHistoryExpanded = !isHistoryExpanded;
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
