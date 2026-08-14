import { describe, expect, it } from 'vitest';
import { compare } from '../src/calculator';
import { HISTORY_KEY, HISTORY_LIMIT, readHistory, saveHistory } from '../src/history';

class MemoryStorage implements Storage { private data = new Map<string, string>(); get length() { return this.data.size; } clear() { this.data.clear(); } getItem(key: string) { return this.data.get(key) ?? null; } key(index: number) { return [...this.data.keys()][index] ?? null; } removeItem(key: string) { this.data.delete(key); } setItem(key: string, value: string) { this.data.set(key, value); } }
const result = compare({ costA: 1, sizeA: 1, costB: 2, sizeB: 1 })!;

describe('history', () => {
  it('keeps the newest 100 entries', () => { const storage = new MemoryStorage(); for (let index = 0; index < HISTORY_LIMIT + 1; index++) saveHistory({ id: String(index), input: { costA: 1, sizeA: 1, costB: 2, sizeB: 1 }, result, savedAt: '2026-01-01' }, storage); expect(readHistory(storage)).toHaveLength(HISTORY_LIMIT); expect(readHistory(storage)[0]?.id).toBe('100'); expect(readHistory(storage).at(-1)?.id).toBe('1'); });
  it('recovers from malformed storage', () => { const storage = new MemoryStorage(); storage.setItem(HISTORY_KEY, '{bad'); expect(readHistory(storage)).toEqual([]); });
});
