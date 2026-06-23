import { describe, it, expect } from "vitest";
import { normalizeAssetProposals } from "@/lib/assetExtraction";

describe("assetExtraction.normalizeAssetProposals", () => {
  it("keeps valid rows and trims fields", () => {
    const rows = normalizeAssetProposals([
      { name: "  Boiler 1 ", location: " Plant A ", model: "X-200" },
    ]);
    expect(rows).toEqual([{ name: "Boiler 1", location: "Plant A", model: "X-200", status: undefined, serial_number: undefined, description: undefined }]);
  });

  it("drops rows without a usable name", () => {
    expect(normalizeAssetProposals([{ name: "" }, { name: "x" }, {}, { status: "ok" }])).toEqual([]);
  });

  it("de-duplicates by case-insensitive name, first wins", () => {
    const rows = normalizeAssetProposals([
      { name: "Pump A", location: "North" },
      { name: "pump a", location: "South" },
      { name: "Pump B" },
    ]);
    expect(rows.map((r) => r.name)).toEqual(["Pump A", "Pump B"]);
    expect(rows[0].location).toBe("North");
  });

  it("ignores non-string fields safely", () => {
    const rows = normalizeAssetProposals([{ name: "Valve", model: 42 as unknown as string }]);
    expect(rows[0].model).toBeUndefined();
  });

  it("handles a null/garbage input list", () => {
    expect(normalizeAssetProposals(null as unknown as [])).toEqual([]);
  });
});
