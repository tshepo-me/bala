import { describe, expect, it } from "vitest";
import { parseLine } from "../parseLine";

describe("parseLine", () => {
  it.each([
    ["2 x milk 2L", 2, "milk 2L"],
    ["2 milk", 2, "milk"],
    ["milk x2", 2, "milk"],
    ["milk 2", 2, "milk"],
    ["3 koo baked beans", 3, "koo baked beans"],
    ["white star 5kg", 1, "white star 5kg"],
    ["2L milk", 1, "2L milk"],
    ["  bread  ", 1, "bread"],
  ])("%s -> qty %i, %s", (input, qty, text) => {
    expect(parseLine(input)).toEqual({ qty, text });
  });

  it("returns null for blank lines", () => {
    expect(parseLine("   ")).toBeNull();
  });
});
