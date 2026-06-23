import { describe, it, expect } from "vitest";
import {
  parseCsvRecords,
  validateAssetRows,
  validateWorkOrderRows,
} from "@/lib/csvImport";

describe("csvImport.parseCsvRecords", () => {
  it("parses header-keyed records and lowercases headers", () => {
    const { records, error } = parseCsvRecords("Name,Status\nPump A,operational\nPump B,down");
    expect(error).toBeNull();
    expect(records).toHaveLength(2);
    expect(records[0]).toEqual({ name: "Pump A", status: "operational" });
  });

  it("handles quoted fields with commas", () => {
    const { records } = parseCsvRecords('name,location\n"Boiler, main","Plant A, North"');
    expect(records[0].name).toBe("Boiler, main");
    expect(records[0].location).toBe("Plant A, North");
  });

  it("errors when there is no data row", () => {
    expect(parseCsvRecords("name,status").error).toMatch(/header.*data/i);
  });
});

describe("csvImport.validateAssetRows", () => {
  it("accepts valid assets and normalizes the purchase date", () => {
    const { records } = parseCsvRecords("name,purchase_date\nForklift,2024-01-15");
    const { rows, errors } = validateAssetRows(records);
    expect(errors).toEqual([]);
    expect(rows[0].name).toBe("Forklift");
    expect(rows[0].purchase_date).toBe(new Date("2024-01-15").toISOString());
  });

  it("rejects rows missing a name or with a bad date", () => {
    const { records } = parseCsvRecords("name,purchase_date\n,2024-01-01\nPump,not-a-date");
    const { rows, errors } = validateAssetRows(records);
    expect(rows).toHaveLength(0);
    expect(errors).toHaveLength(2);
  });
});

describe("csvImport.validateWorkOrderRows", () => {
  it("defaults invalid priority/status and fills short descriptions", () => {
    const { records } = parseCsvRecords("title,priority,status\nFix conveyor,whenever,unknown");
    const { rows } = validateWorkOrderRows(records);
    expect(rows[0].priority).toBe("medium");
    expect(rows[0].status).toBe("pending");
    expect(rows[0].description.length).toBeGreaterThanOrEqual(5);
  });

  it("keeps valid enums and rejects too-short titles", () => {
    const { records } = parseCsvRecords("title,priority,status\nReplace filter,high,in_progress\nx,low,pending");
    const { rows, errors } = validateWorkOrderRows(records);
    expect(rows).toHaveLength(1);
    expect(rows[0].priority).toBe("high");
    expect(rows[0].status).toBe("in_progress");
    expect(errors).toHaveLength(1);
  });
});
