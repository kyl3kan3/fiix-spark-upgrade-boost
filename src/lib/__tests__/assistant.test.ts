import { describe, it, expect } from "vitest";
import {
  normalizeWorkOrderProposal,
  normalizeCostProposal,
  normalizeEnergyProposal,
  normalizeProposal,
} from "@/lib/assistant";

describe("assistant.normalizeWorkOrderProposal", () => {
  it("returns null when the title is too short", () => {
    expect(normalizeWorkOrderProposal({ title: "ab" })).toBeNull();
    expect(normalizeWorkOrderProposal({})).toBeNull();
  });

  it("keeps a valid proposal and normalizes the date to ISO", () => {
    const p = normalizeWorkOrderProposal({
      title: "Replace pump seal",
      description: "Seal is leaking on the main feed pump",
      priority: "high",
      asset_id: "asset-1",
      due_date: "2026-07-01",
    });
    expect(p).not.toBeNull();
    expect(p!.priority).toBe("high");
    expect(p!.asset_id).toBe("asset-1");
    expect(p!.due_date).toBe(new Date("2026-07-01").toISOString());
  });

  it("defaults an unknown priority to medium", () => {
    expect(normalizeWorkOrderProposal({ title: "Inspect belt", priority: "whenever" })!.priority).toBe("medium");
  });

  it("fills a too-short description to satisfy the form minimum", () => {
    const p = normalizeWorkOrderProposal({ title: "Check filter", description: "x" });
    expect(p!.description.length).toBeGreaterThanOrEqual(5);
    expect(p!.description).toContain("Check filter");
  });
});

describe("assistant.normalizeCostProposal", () => {
  it("requires a non-negative amount", () => {
    expect(normalizeCostProposal({ amount: -5 })).toBeNull();
    expect(normalizeCostProposal({})).toBeNull();
  });

  it("keeps valid fields and defaults category/type/currency", () => {
    const p = normalizeCostProposal({ amount: 250, category: "parts", maintenance_type: "preventive", asset_id: "a1" });
    expect(p).toEqual({
      type: "cost",
      amount: 250,
      category: "parts",
      maintenance_type: "preventive",
      currency: "USD",
      asset_id: "a1",
      description: null,
    });
  });

  it("falls back to other/reactive for unknown enums", () => {
    const p = normalizeCostProposal({ amount: 10, category: "bogus", maintenance_type: "bogus" });
    expect(p!.category).toBe("other");
    expect(p!.maintenance_type).toBe("reactive");
  });
});

describe("assistant.normalizeEnergyProposal", () => {
  it("requires a non-negative kWh", () => {
    expect(normalizeEnergyProposal({ kwh: -1 })).toBeNull();
    expect(normalizeEnergyProposal({})).toBeNull();
  });

  it("keeps kWh + optional cost, nulls a negative cost", () => {
    expect(normalizeEnergyProposal({ kwh: 120, cost: 24, meter_label: "Main" })).toMatchObject({
      type: "energy",
      kwh: 120,
      cost: 24,
      meter_label: "Main",
    });
    expect(normalizeEnergyProposal({ kwh: 5, cost: -3 })!.cost).toBeNull();
  });

  it("accepts numeric strings", () => {
    expect(normalizeEnergyProposal({ kwh: "80" })!.kwh).toBe(80);
  });
});

describe("assistant.normalizeProposal", () => {
  it("dispatches by type", () => {
    expect(normalizeProposal({ type: "cost", amount: 1 })!.type).toBe("cost");
    expect(normalizeProposal({ type: "energy", kwh: 1 })!.type).toBe("energy");
    expect(normalizeProposal({ type: "work_order", title: "Fix it" })!.type).toBe("work_order");
    expect(normalizeProposal({ type: "mystery" })).toBeNull();
  });
});
