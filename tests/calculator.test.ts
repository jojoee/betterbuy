import { describe, expect, it } from "vitest";
import { compare } from "../src/calculator";

describe("compare", () => {
  it("selects A and computes its saving", () =>
    expect(
      compare({ costA: 40, sizeA: 500, costB: 70, sizeB: 1000 }),
    ).toMatchObject({ winner: "B", savingPercent: 12.5 }));
  it("selects B", () =>
    expect(compare({ costA: 8, sizeA: 10, costB: 7, sizeB: 10 })).toMatchObject(
      { winner: "B", savingPercent: 12.5 },
    ));
  it("returns a tie", () =>
    expect(compare({ costA: 10, sizeA: 2, costB: 15, sizeB: 3 })).toMatchObject(
      { winner: null, savingPercent: 0 },
    ));
  it("rejects invalid values", () =>
    expect(compare({ costA: 0, sizeA: 1, costB: 1, sizeB: 1 })).toBeNull());
});
