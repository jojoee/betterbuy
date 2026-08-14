import { describe, expect, it } from "vitest";
import { compare, formatNumber, isPositiveFinite } from "../src/calculator";

describe("compare", () => {
  it("selects A and computes its saving", () =>
    expect(
      compare({ costA: 40, sizeA: 500, costB: 70, sizeB: 1000 }),
    ).toMatchObject({ winner: "B", savingPercent: 12.5 }));
  it("selects B", () =>
    expect(compare({ costA: 8, sizeA: 10, costB: 7, sizeB: 10 })).toMatchObject(
      { winner: "B", savingPercent: 12.5 },
    ));
  it("selects A", () =>
    expect(compare({ costA: 7, sizeA: 10, costB: 8, sizeB: 10 })).toMatchObject(
      { winner: "A", savingPercent: 12.5 },
    ));
  it("returns a tie", () =>
    expect(compare({ costA: 10, sizeA: 2, costB: 15, sizeB: 3 })).toMatchObject(
      { winner: null, savingPercent: 0 },
    ));
  it("rejects invalid values", () =>
    expect(compare({ costA: 0, sizeA: 1, costB: 1, sizeB: 1 })).toBeNull());
  it("accepts only positive finite values", () => {
    expect(isPositiveFinite(1)).toBe(true);
    expect(isPositiveFinite(0)).toBe(false);
    expect(isPositiveFinite(Infinity)).toBe(false);
  });
  it("formats values with a configurable precision", () => {
    expect(formatNumber(1.23456)).toBe("1.2346");
    expect(formatNumber(1.23456, 1)).toBe("1.2");
  });
});
