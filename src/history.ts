import type { ComparisonInput, ComparisonResult } from "./calculator";

export const HISTORY_KEY = "betterbuy.history.v1";
export const HISTORY_LIMIT = 50;
export const PIN_LIMIT = 5;

export interface HistoryEntry {
  id: string;
  input: ComparisonInput;
  result: ComparisonResult;
  savedAt: string;
  pinnedAt?: string;
}

export function readHistory(storage: Storage = localStorage): HistoryEntry[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(HISTORY_KEY) ?? "[]");
    if (!Array.isArray(value)) return [];
    const entries = value.filter(isHistoryEntry);
    const normalized = limitHistory(entries);
    if (JSON.stringify(entries) !== JSON.stringify(normalized))
      try {
        storage.setItem(HISTORY_KEY, JSON.stringify(normalized));
      } catch {
        // A readable but full storage should not hide valid history.
      }
    return normalized;
  } catch {
    return [];
  }
}

export function saveHistory(
  entry: HistoryEntry,
  storage: Storage = localStorage,
): HistoryEntry[] {
  const next = limitHistory([entry, ...readHistory(storage)]);
  storage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function deleteHistory(
  id: string,
  storage: Storage = localStorage,
): HistoryEntry[] {
  const next = readHistory(storage).filter((entry) => entry.id !== id);
  storage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function pinHistory(
  id: string,
  storage: Storage = localStorage,
  pinnedAt: string = new Date().toISOString(),
): HistoryEntry[] {
  const current = readHistory(storage);
  if (current.filter((entry) => entry.pinnedAt).length >= PIN_LIMIT)
    return current;
  const next = limitHistory(
    current.map((entry) => (entry.id === id ? { ...entry, pinnedAt } : entry)),
  );
  storage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function unpinHistory(
  id: string,
  storage: Storage = localStorage,
): HistoryEntry[] {
  const next = limitHistory(
    readHistory(storage).map((entry) => {
      if (entry.id !== id) return entry;
      const { pinnedAt: _pinnedAt, ...unpinnedEntry } = entry;
      return unpinnedEntry;
    }),
  );
  storage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

function limitHistory(entries: HistoryEntry[]): HistoryEntry[] {
  const pinned = entries
    .filter((entry) => entry.pinnedAt)
    .sort((a, b) => (b.pinnedAt ?? "").localeCompare(a.pinnedAt ?? ""))
    .slice(0, PIN_LIMIT);
  const pinnedIds = new Set(pinned.map((entry) => entry.id));
  const unpinned = entries
    .filter((entry) => !pinnedIds.has(entry.id))
    .map((entry) => {
      if (!entry.pinnedAt) return entry;
      const { pinnedAt: _pinnedAt, ...unpinnedEntry } = entry;
      return unpinnedEntry;
    })
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
  return [...pinned, ...unpinned].slice(0, HISTORY_LIMIT);
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== "object" || value === null) return false;
  const entry = value as Partial<HistoryEntry>;
  return (
    typeof entry.id === "string" &&
    typeof entry.savedAt === "string" &&
    (entry.pinnedAt === undefined || typeof entry.pinnedAt === "string") &&
    typeof entry.input === "object" &&
    entry.input !== null &&
    typeof entry.result === "object" &&
    entry.result !== null
  );
}
