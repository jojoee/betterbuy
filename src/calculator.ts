export type OptionName = "A" | "B";

export interface ComparisonInput {
  costA: number;
  sizeA: number;
  costB: number;
  sizeB: number;
}

export interface ComparisonResult {
  unitCostA: number;
  unitCostB: number;
  winner: OptionName | null;
  savingPercent: number;
}

export function isPositiveFinite(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function compare(input: ComparisonInput): ComparisonResult | null {
  if (!Object.values(input).every(isPositiveFinite)) return null;

  const unitCostA = input.costA / input.sizeA;
  const unitCostB = input.costB / input.sizeB;
  if (unitCostA === unitCostB) {
    return { unitCostA, unitCostB, winner: null, savingPercent: 0 };
  }

  const winner = unitCostA < unitCostB ? "A" : "B";
  const lower = Math.min(unitCostA, unitCostB);
  const higher = Math.max(unitCostA, unitCostB);
  const savingPercent = Number((((higher - lower) / higher) * 100).toFixed(10));
  return { unitCostA, unitCostB, winner, savingPercent };
}

export function formatNumber(value: number, maximumFractionDigits = 4): string {
  return new Intl.NumberFormat("en", { maximumFractionDigits }).format(value);
}
