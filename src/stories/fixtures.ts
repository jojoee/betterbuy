import type { HistoryEntry } from "../history";

export const validValues = {
  costA: 40,
  sizeA: 500,
  costB: 70,
  sizeB: 1000,
};

export const savedEntries: HistoryEntry[] = Array.from(
  { length: 5 },
  (_, index) => ({
    id: `entry-${index + 1}`,
    input: { costA: 10 + index, sizeA: 100, costB: 20 + index, sizeB: 100 },
    result: {
      unitCostA: (10 + index) / 100,
      unitCostB: (20 + index) / 100,
      winner: "A",
      savingPercent: 50,
    },
    savedAt: `2026-08-0${index + 1}T00:00:00.000Z`,
  }),
);

export const pinnedEntries = savedEntries.map((entry, index) => ({
  ...entry,
  pinnedAt: `2026-08-1${index}T00:00:00.000Z`,
}));
