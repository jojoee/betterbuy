import { describe, expect, it } from "vitest";
import { betterbuyReducer, type BetterbuyState } from "../src/store";

const base: BetterbuyState = {
  values: {
    costA: Number.NaN,
    sizeA: Number.NaN,
    costB: Number.NaN,
    sizeB: Number.NaN,
  },
  history: [],
  isHistoryExpanded: true,
};
const entry = {
  id: "entry",
  input: { costA: 1, sizeA: 1, costB: 2, sizeB: 1 },
  result: {
    unitCostA: 1,
    unitCostB: 2,
    winner: "A" as const,
    savingPercent: 50,
  },
  savedAt: "2026-01-01T00:00:00.000Z",
};

describe("betterbuyReducer", () => {
  it("handles named actions without browser persistence", () => {
    const field = betterbuyReducer(base, {
      type: "comparison/setField",
      field: "costA",
      value: 10,
    });
    const saved = betterbuyReducer(field, { type: "history/save", entry });
    const pinned = betterbuyReducer(saved, {
      type: "history/pin",
      id: entry.id,
      pinnedAt: "2026-02-01",
    });
    const restored = betterbuyReducer(pinned, {
      type: "history/restore",
      input: entry.input,
    });
    const unpinned = betterbuyReducer(restored, {
      type: "history/unpin",
      id: entry.id,
    });
    const expanded = betterbuyReducer(unpinned, {
      type: "history/toggleExpanded",
    });
    const deleted = betterbuyReducer(expanded, {
      type: "history/delete",
      id: entry.id,
    });

    expect(field.values.costA).toBe(10);
    expect(saved.isHistoryExpanded).toBe(false);
    expect(pinned.history[0]?.pinnedAt).toBe("2026-02-01");
    expect(restored.values).toEqual(entry.input);
    expect(unpinned.history[0]?.pinnedAt).toBeUndefined();
    expect(expanded.isHistoryExpanded).toBe(true);
    expect(deleted.history).toEqual([]);
  });
});
