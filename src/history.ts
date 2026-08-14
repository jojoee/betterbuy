import type { ComparisonInput, ComparisonResult } from './calculator';

export const HISTORY_KEY = 'betterbuy.history.v1';
export const HISTORY_LIMIT = 100;

export interface HistoryEntry {
  id: string;
  input: ComparisonInput;
  result: ComparisonResult;
  savedAt: string;
}

export function readHistory(storage: Storage = localStorage): HistoryEntry[] {
  try {
    const value: unknown = JSON.parse(storage.getItem(HISTORY_KEY) ?? '[]');
    return Array.isArray(value) ? value.filter(isHistoryEntry).slice(0, HISTORY_LIMIT) : [];
  } catch {
    return [];
  }
}

export function saveHistory(entry: HistoryEntry, storage: Storage = localStorage): HistoryEntry[] {
  const next = [entry, ...readHistory(storage)].slice(0, HISTORY_LIMIT);
  storage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

export function deleteHistory(id: string, storage: Storage = localStorage): HistoryEntry[] {
  const next = readHistory(storage).filter((entry) => entry.id !== id);
  storage.setItem(HISTORY_KEY, JSON.stringify(next));
  return next;
}

function isHistoryEntry(value: unknown): value is HistoryEntry {
  if (typeof value !== 'object' || value === null) return false;
  const entry = value as Partial<HistoryEntry>;
  return typeof entry.id === 'string' && typeof entry.savedAt === 'string' &&
    typeof entry.input === 'object' && entry.input !== null &&
    typeof entry.result === 'object' && entry.result !== null;
}
