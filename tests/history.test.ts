import { describe, expect, it } from "vitest";
import { compare } from "../src/calculator";
import {
  HISTORY_KEY,
  HISTORY_LIMIT,
  PIN_LIMIT,
  deleteHistory,
  pinHistory,
  readHistory,
  saveHistory,
  unpinHistory,
} from "../src/history";

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(key: string) {
    return this.data.get(key) ?? null;
  }
  key(index: number) {
    return [...this.data.keys()][index] ?? null;
  }
  removeItem(key: string) {
    this.data.delete(key);
  }
  setItem(key: string, value: string) {
    this.data.set(key, value);
  }
}
const result = compare({ costA: 1, sizeA: 1, costB: 2, sizeB: 1 })!;

describe("history", () => {
  it("keeps the newest 50 entries", () => {
    const storage = new MemoryStorage();
    for (let index = 0; index < HISTORY_LIMIT + 1; index++)
      saveHistory(
        {
          id: String(index),
          input: { costA: 1, sizeA: 1, costB: 2, sizeB: 1 },
          result,
          savedAt: "2026-01-01",
        },
        storage,
      );
    expect(readHistory(storage)).toHaveLength(HISTORY_LIMIT);
    expect(readHistory(storage)[0]?.id).toBe("50");
    expect(readHistory(storage).at(-1)?.id).toBe("1");
  });

  it("persists the 50-entry cap for legacy storage", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      HISTORY_KEY,
      JSON.stringify(
        Array.from({ length: 100 }, (_, index) => ({
          id: String(index),
          input: { costA: 1, sizeA: 1, costB: 2, sizeB: 1 },
          result,
          savedAt: `2026-01-${String(index + 1).padStart(2, "0")}`,
        })),
      ),
    );

    expect(readHistory(storage)).toHaveLength(HISTORY_LIMIT);
    expect(JSON.parse(storage.getItem(HISTORY_KEY) ?? "[]")).toHaveLength(
      HISTORY_LIMIT,
    );
  });
  it("recovers from malformed storage", () => {
    const storage = new MemoryStorage();
    storage.setItem(HISTORY_KEY, "{bad");
    expect(readHistory(storage)).toEqual([]);
  });
  it("filters invalid entries and deletes entries by id", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      HISTORY_KEY,
      JSON.stringify([
        { id: "valid", input: {}, result: {}, savedAt: "2026-01-01" },
        { id: 1, input: {}, result: {}, savedAt: "2026-01-01" },
      ]),
    );

    expect(readHistory(storage)).toHaveLength(1);
    expect(deleteHistory("valid", storage)).toEqual([]);
    expect(readHistory(storage)).toEqual([]);
  });

  it("pins up to five entries, most recently pinned first", () => {
    const storage = new MemoryStorage();
    for (let index = 1; index <= PIN_LIMIT + 1; index++)
      saveHistory(
        {
          id: String(index),
          input: { costA: 1, sizeA: 1, costB: 2, sizeB: 1 },
          result,
          savedAt: `2026-01-0${index}`,
        },
        storage,
      );

    for (let index = 1; index <= PIN_LIMIT; index++)
      pinHistory(String(index), storage, `2026-02-0${index}`);
    pinHistory(String(PIN_LIMIT + 1), storage, "2026-02-09");

    expect(readHistory(storage).filter((entry) => entry.pinnedAt)).toHaveLength(
      PIN_LIMIT,
    );
    expect(
      readHistory(storage)
        .slice(0, PIN_LIMIT)
        .map((entry) => entry.id),
    ).toEqual(["5", "4", "3", "2", "1"]);
    expect(
      unpinHistory("5", storage).find((entry) => entry.id === "5")?.pinnedAt,
    ).toBeUndefined();
  });

  it("preserves pins while saving at the cap", () => {
    const storage = new MemoryStorage();
    for (let index = 0; index < HISTORY_LIMIT; index++)
      saveHistory(
        {
          id: String(index),
          input: { costA: 1, sizeA: 1, costB: 2, sizeB: 1 },
          result,
          savedAt: `2026-01-${String(index + 1).padStart(2, "0")}`,
          ...(index < PIN_LIMIT
            ? { pinnedAt: `2026-02-${String(index + 1).padStart(2, "0")}` }
            : {}),
        },
        storage,
      );

    saveHistory(
      {
        id: "new",
        input: { costA: 1, sizeA: 1, costB: 2, sizeB: 1 },
        result,
        savedAt: "2026-03-01",
      },
      storage,
    );

    const saved = readHistory(storage);
    expect(saved).toHaveLength(HISTORY_LIMIT);
    expect(saved.filter((entry) => entry.pinnedAt)).toHaveLength(PIN_LIMIT);
    expect(saved.some((entry) => entry.id === "5")).toBe(false);
    expect(saved.some((entry) => entry.id === "new")).toBe(true);
  });

  it("returns an unpinned entry to saved-time order", () => {
    const storage = new MemoryStorage();
    storage.setItem(
      HISTORY_KEY,
      JSON.stringify([
        {
          id: "old",
          input: { costA: 1, sizeA: 1, costB: 2, sizeB: 1 },
          result,
          savedAt: "2026-01-01",
          pinnedAt: "2026-03-01",
        },
        {
          id: "new",
          input: { costA: 1, sizeA: 1, costB: 2, sizeB: 1 },
          result,
          savedAt: "2026-02-01",
        },
      ]),
    );

    expect(unpinHistory("old", storage).map((entry) => entry.id)).toEqual([
      "new",
      "old",
    ]);
  });
});
