import { describe, it, expect } from "vitest";
import { normalizeWorkOrderProposal } from "@/lib/assistant";

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
    const p = normalizeWorkOrderProposal({ title: "Inspect belt", priority: "whenever" });
    expect(p!.priority).toBe("medium");
  });

  it("fills a too-short description to satisfy the form minimum", () => {
    const p = normalizeWorkOrderProposal({ title: "Check filter", description: "x" });
    expect(p!.description.length).toBeGreaterThanOrEqual(5);
    expect(p!.description).toContain("Check filter");
  });

  it("nulls out a blank or invalid asset_id and due_date", () => {
    const p = normalizeWorkOrderProposal({ title: "Grease bearings", asset_id: "  ", due_date: "nope" });
    expect(p!.asset_id).toBeNull();
    expect(p!.due_date).toBeNull();
  });
});
