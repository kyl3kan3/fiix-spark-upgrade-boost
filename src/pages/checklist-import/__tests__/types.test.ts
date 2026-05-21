import { describe, expect, it } from "vitest";
import { NONE, normalizeTitle } from "../types";

describe("normalizeTitle", () => {
  it("lowercases and collapses whitespace", () => {
    expect(normalizeTitle("Check  Oil  Level")).toBe("check oil level");
    expect(normalizeTitle("  trim me  ")).toBe("trim me");
  });

  it("strips punctuation and symbols (Unicode-aware)", () => {
    expect(normalizeTitle("Inspect: belts & pulleys!")).toBe("inspect belts pulleys");
    expect(normalizeTitle("Verify readings.")).toBe("verify readings");
  });

  it("treats whitespace-only and punctuation-only input as empty", () => {
    expect(normalizeTitle("   ")).toBe("");
    expect(normalizeTitle("---")).toBe("");
  });

  it("makes visually-different duplicates compare equal", () => {
    expect(normalizeTitle("Check Oil Level")).toBe(normalizeTitle("check oil level."));
    expect(normalizeTitle("Item 1")).toBe(normalizeTitle("item   1"));
  });
});

describe("NONE", () => {
  it("is a sentinel that won't collide with a real column name", () => {
    expect(NONE).toBe("__none__");
  });
});
