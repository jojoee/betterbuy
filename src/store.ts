import { createStore } from "zustand/vanilla";
import { devtools, redux } from "zustand/middleware";
import { useStore } from "zustand";
import { compare, type ComparisonInput } from "./calculator";
import {
  PIN_LIMIT,
  normalizeHistory,
  readHistory,
  type HistoryEntry,
  writeHistory,
} from "./history";

export type ComparisonField = keyof ComparisonInput;

export interface BetterbuyState {
  values: ComparisonInput;
  history: HistoryEntry[];
  isHistoryExpanded: boolean;
}

export type BetterbuyAction =
  | { type: "comparison/setField"; field: ComparisonField; value: number }
  | { type: "history/save"; entry: HistoryEntry }
  | { type: "history/restore"; input: ComparisonInput }
  | { type: "history/pin"; id: string; pinnedAt: string }
  | { type: "history/unpin"; id: string }
  | { type: "history/delete"; id: string }
  | { type: "history/toggleExpanded" };

const emptyInput: ComparisonInput = {
  costA: Number.NaN,
  sizeA: Number.NaN,
  costB: Number.NaN,
  sizeB: Number.NaN,
};

export function betterbuyReducer(
  state: BetterbuyState,
  action: BetterbuyAction,
): BetterbuyState {
  switch (action.type) {
    case "comparison/setField":
      return {
        ...state,
        values: { ...state.values, [action.field]: action.value },
      };
    case "history/save":
      return {
        ...state,
        history: normalizeHistory([action.entry, ...state.history]),
        isHistoryExpanded: false,
      };
    case "history/restore":
      return { ...state, values: { ...action.input } };
    case "history/delete":
      return {
        ...state,
        history: state.history.filter((entry) => entry.id !== action.id),
      };
    case "history/pin": {
      if (state.history.filter((entry) => entry.pinnedAt).length >= PIN_LIMIT)
        return state;
      return {
        ...state,
        history: normalizeHistory(
          state.history.map((entry) =>
            entry.id === action.id
              ? { ...entry, pinnedAt: action.pinnedAt }
              : entry,
          ),
        ),
      };
    }
    case "history/unpin":
      return {
        ...state,
        history: normalizeHistory(
          state.history.map((entry) => {
            if (entry.id !== action.id) return entry;
            const { pinnedAt: _pinnedAt, ...unpinned } = entry;
            return unpinned;
          }),
        ),
      };
    case "history/toggleExpanded":
      return { ...state, isHistoryExpanded: !state.isHistoryExpanded };
  }
}

const initialState: BetterbuyState = {
  values: { ...emptyInput },
  history: readHistory(),
  isHistoryExpanded: false,
};

export const betterbuyStore = createStore(
  devtools(redux(betterbuyReducer, initialState), {
    enabled: import.meta.env.DEV,
    name: "Betterbuy",
  }),
);

export function useBetterbuyStore<T>(
  selector: (state: BetterbuyState) => T,
): T {
  return useStore(betterbuyStore, selector);
}

export function dispatch(action: BetterbuyAction): void {
  betterbuyStore.dispatch(action);
}

function persistHistory(): void {
  writeHistory(betterbuyStore.getState().history);
}

export function saveCurrentComparison(): void {
  const values = betterbuyStore.getState().values;
  const result = compare(values);
  if (!result) return;
  dispatch({
    type: "history/save",
    entry: {
      id: crypto.randomUUID(),
      input: { ...values },
      result,
      savedAt: new Date().toISOString(),
    },
  });
  persistHistory();
}

export function pinHistoryEntry(id: string): void {
  dispatch({ type: "history/pin", id, pinnedAt: new Date().toISOString() });
  persistHistory();
}

export function unpinHistoryEntry(id: string): void {
  dispatch({ type: "history/unpin", id });
  persistHistory();
}

export function deleteHistoryEntry(id: string): void {
  dispatch({ type: "history/delete", id });
  persistHistory();
}
