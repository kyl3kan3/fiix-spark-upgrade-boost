import { describe, it, expect } from "vitest";
import { splitCsvLine } from "@/lib/csvParser";

describe("csvParser.splitCsvLine", () => {
  it("splits plain comma-separated fields and trims them", () => {
    expect(splitCsvLine("a, b ,c")).toEqual(["a", "b", "c"]);
  });

  it("preserves commas inside quoted fields", () => {
    expect(splitCsvLine('"Boiler, main","Plant A, North"')).toEqual(["Boiler, main", "Plant A, North"]);
  });

  it("unescapes doubled quotes inside a quoted field", () => {
    expect(splitCsvLine('"a ""b"" c",d')).toEqual(['a "b" c', "d"]);
  });

  it("returns a trailing empty field", () => {
    expect(splitCsvLine("a,b,")).toEqual(["a", "b", ""]);
  });
});
