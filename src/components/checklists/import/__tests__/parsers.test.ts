import { describe, expect, it } from "vitest";
import { NONE, normalizeTitle } from "../parsers";

describe("normalizeTitle", () => {
  it("lowercases and collapses whitespace", () => {
    expect(normalizeTitle("Check  Oil  Level")).toBe("check oil level");
    expect(normalizeTitle("  trim me  ")).toBe("trim me");
  });

  it("strips punctuation and symbols (Unicode-aware)", () => {
    expect(normalizeTitle("Inspect: belts & pulleys!")).toBe("inspect belts pulleys");
    expect(normalizeTitle("Verify °F readings")).toBe("verify f readings");
  });

  it("treats whitespace-only and punctuation-only inputs as empty", () => {
    expect(normalizeTitle("   ")).toBe("");
    expect(normalizeTitle("---")).toBe("");
  });

  it("returns identical normalized forms for visually-different duplicates", () => {
    expect(normalizeTitle("Check Oil Level")).toBe(normalizeTitle("check oil level."));
    expect(normalizeTitle("Item 1")).toBe(normalizeTitle("item   1"));
  });
});

describe("NONE", () => {
  it("uses a sentinel that won't collide with a real column name", () => {
    expect(NONE).toBe("__none__");
    expect(NONE.startsWith("__")).toBe(true);
  });
});
