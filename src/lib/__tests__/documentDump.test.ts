import { describe, it, expect } from "vitest";
import {
  sanitizeFileName,
  buildStoragePath,
  inferDocKind,
  formatBytes,
} from "@/lib/documentDump";

describe("documentDump.sanitizeFileName", () => {
  it("slugifies the base and lowercases the extension", () => {
    expect(sanitizeFileName("My Asset List (Final).CSV")).toBe("my-asset-list-final.csv");
  });

  it("handles names without an extension", () => {
    expect(sanitizeFileName("Floor Plan")).toBe("floor-plan");
  });

  it("falls back to 'file' when the base slugifies to nothing", () => {
    expect(sanitizeFileName("___.pdf")).toBe("file.pdf");
  });

  it("does not treat a leading dot as an extension", () => {
    expect(sanitizeFileName(".gitignore")).toBe("gitignore");
  });
});

describe("documentDump.buildStoragePath", () => {
  it("namespaces under the company id with the uuid prefix", () => {
    expect(buildStoragePath("comp-1", "Pump Manual.pdf", "uuid-9")).toBe(
      "comp-1/uuid-9-pump-manual.pdf",
    );
  });
});

describe("documentDump.inferDocKind", () => {
  it("detects asset lists from spreadsheet names", () => {
    expect(inferDocKind("equipment-inventory.csv")).toBe("asset_list");
  });
  it("detects manuals", () => {
    expect(inferDocKind("Boiler User Manual.pdf")).toBe("manual");
  });
  it("detects floor plans", () => {
    expect(inferDocKind("building-floorplan.pdf")).toBe("floor_plan");
  });
  it("falls back to other", () => {
    expect(inferDocKind("random.pdf")).toBe("other");
  });
});

describe("documentDump.formatBytes", () => {
  it("formats zero / nullish", () => {
    expect(formatBytes(0)).toBe("0 B");
    expect(formatBytes(null)).toBe("0 B");
  });
  it("formats KB and MB", () => {
    expect(formatBytes(1024)).toBe("1 KB");
    expect(formatBytes(1536)).toBe("1.5 KB");
    expect(formatBytes(5 * 1024 * 1024)).toBe("5 MB");
  });
});
