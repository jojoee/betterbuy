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

function requiredElement<T extends Element>(selector: string): T {
  const element = document.querySelector<T>(selector);
  if (!element) throw new Error(`Required element not found: ${selector}`);
  return element;
}

const brandIcon = requiredElement<HTMLImageElement>("#brand-icon");
const resultContainer = requiredElement<HTMLDivElement>("#comparison-result");
const saveButton = requiredElement<HTMLButtonElement>("#save");
const historyCount = requiredElement<HTMLSpanElement>("#history-count");
const historyContent = requiredElement<HTMLDivElement>("#history-content");

function createResult(result: ComparisonResult | null): HTMLElement {
  if (!result) {
    const placeholder = document.createElement("p");
    placeholder.className = "ds-alert result-placeholder";
    placeholder.setAttribute("aria-live", "polite");
    placeholder.textContent = "Enter positive Cost and Size values to compare.";
    return placeholder;
  }

  const alert = document.createElement("div");
  alert.className = "ds-alert result";
  if (result.winner) alert.classList.add("ds-alert--success");
  alert.setAttribute("aria-live", "polite");
  const headline = result.winner
    ? `${result.winner} is ${formatNumber(result.savingPercent, 1)}% cheaper`
    : "A and B cost the same per size";

  const title = document.createElement("strong");
  title.textContent = headline;
  const detail = document.createElement("span");
  detail.textContent = `A: ${formatNumber(result.unitCostA)} per size · B: ${formatNumber(result.unitCostB)} per size`;
  alert.replaceChildren(title, detail);
  return alert;
}

function createHistoryItem(
  entry: HistoryEntry,
  pinLimitReached: boolean,
): HTMLLIElement {
  const winner = entry.result.winner
    ? `${entry.result.winner} is ${formatNumber(entry.result.savingPercent, 1)}% cheaper`
    : "Same cost per size";
  const isPinned = Boolean(entry.pinnedAt);

  const restore = document.createElement("button");
  restore.className = "ds-list-item__restore history-restore";
  restore.dataset.restore = entry.id;
  restore.setAttribute("aria-label", "Restore saved comparison");
  const comparison = document.createElement("span");
  comparison.textContent = `A ${formatNumber(entry.input.costA)} / ${formatNumber(entry.input.sizeA)} · B ${formatNumber(entry.input.costB)} / ${formatNumber(entry.input.sizeB)}`;
  const summary = document.createElement("small");
  summary.textContent = winner;
  restore.replaceChildren(comparison, summary);

  const pin = document.createElement("button");
  pin.className = "ds-button ds-button--subtle-success";
  pin.dataset.pin = entry.id;
  pin.setAttribute(
    "aria-label",
    `${isPinned ? "Unpin" : "Pin"} saved comparison`,
  );
  pin.textContent = isPinned ? "Unpin" : "Pin";
  if (!isPinned && pinLimitReached) {
    pin.disabled = true;
    pin.setAttribute("aria-describedby", "pin-limit");
  }

  const remove = document.createElement("button");
  remove.className = "ds-button ds-button--subtle-danger";
  remove.dataset.delete = entry.id;
  remove.setAttribute("aria-label", "Delete saved comparison");
  remove.textContent = "Delete";

  const actions = document.createElement("div");
  actions.className = "ds-list-item__actions";
  actions.replaceChildren(pin, remove);

  const item = document.createElement("li");
  item.className = "ds-list-item";
  item.dataset.historyId = entry.id;
  item.replaceChildren(restore, actions);
  return item;
}

function createHistoryList(
  entries: HistoryEntry[],
  group: "pinned" | "unpinned",
  pinLimitReached: boolean,
): HTMLUListElement {
  const list = document.createElement("ul");
  list.className = "ds-list history-list";
  list.dataset.historyGroup = group;
  list.replaceChildren(
    ...entries.map((entry) => createHistoryItem(entry, pinLimitReached)),
  );
  return list;
}

function createHistoryContent(): DocumentFragment {
  const content = document.createDocumentFragment();
  if (!history.length) {
    const empty = document.createElement("p");
    empty.className = "ds-empty-state empty-history";
    empty.textContent = "No saved comparisons yet.";
    content.append(empty);
    return content;
  }

  const pinned = history
    .filter((entry) => entry.pinnedAt)
    .sort((a, b) => (b.pinnedAt ?? "").localeCompare(a.pinnedAt ?? ""));
  const unpinned = history.filter((entry) => !entry.pinnedAt);
  const visibleUnpinned = isHistoryExpanded ? unpinned : unpinned.slice(0, 3);
  const canToggleUnpinned = unpinned.length > 3;
  const pinLimitReached = pinned.length >= PIN_LIMIT;
  if (pinned.length) {
    const title = document.createElement("h3");
    title.textContent = `Pinned (${pinned.length})`;
    const heading = document.createElement("div");
    heading.className = "history-group-title";
    heading.append(title);
    const group = document.createElement("section");
    group.className = "history-group";
    group.replaceChildren(
      heading,
      createHistoryList(pinned, "pinned", pinLimitReached),
    );
    content.append(group);
  }
  if (pinLimitReached) {
    const limit = document.createElement("p");
    limit.id = "pin-limit";
    limit.className = "pin-limit";
    limit.textContent = "Unpin a saved comparison to pin another.";
    content.append(limit);
  }
  if (visibleUnpinned.length)
    content.append(
      createHistoryList(visibleUnpinned, "unpinned", pinLimitReached),
    );
  if (canToggleUnpinned) {
    const toggle = document.createElement("button");
    toggle.id = "show-more-history";
    toggle.className =
      "ds-button ds-button--secondary ds-button--block show-more";
    toggle.textContent = isHistoryExpanded ? "Show less" : "Show more";
    content.append(toggle);
  }
  return content;
}

function renderComparison(): void {
  const result = compare(values);
  resultContainer.replaceChildren(createResult(result));
  saveButton.disabled = !result;
}

function renderHistory(): void {
  historyCount.textContent = `${history.length}/50`;
  historyContent.replaceChildren(createHistoryContent());
}

function initialize(): void {
  brandIcon.src = `${baseUrl}icons/betterbuy-overlap.svg`;
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
  saveButton.addEventListener("click", () => {
    const savedResult = compare(values);
    if (!savedResult) return;
    history = saveHistory({
      id: crypto.randomUUID(),
      input: { ...values },
      result: savedResult,
      savedAt: new Date().toISOString(),
    });
    isHistoryExpanded = false;
    renderHistory();
  });
  historyContent.addEventListener("click", (event) => {
    const button =
      event.target instanceof Element
        ? event.target.closest<HTMLButtonElement>("button")
        : null;
    if (!button) return;
    if (button.dataset.delete) {
      history = deleteHistory(button.dataset.delete);
      renderHistory();
      return;
    }
    if (button.dataset.pin) {
      const entry = history.find((item) => item.id === button.dataset.pin);
      if (!entry) return;
      history = entry.pinnedAt ? unpinHistory(entry.id) : pinHistory(entry.id);
      renderHistory();
      return;
    }
    if (button.id === "show-more-history") {
      isHistoryExpanded = !isHistoryExpanded;
      renderHistory();
      return;
    }
    if (button.dataset.restore) {
      const entry = history.find((item) => item.id === button.dataset.restore);
      if (!entry) return;
      values = { ...entry.input };
      for (const input of document.querySelectorAll<HTMLInputElement>(
        "[data-key]",
      )) {
        const key = input.dataset.key as keyof ComparisonInput;
        input.value = String(values[key]);
      }
      renderComparison();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });
  renderComparison();
  renderHistory();
}

if ("serviceWorker" in navigator)
  window.addEventListener("load", () =>
    navigator.serviceWorker.register(`${baseUrl}sw.js`),
  );
initialize();
