import { beforeEach, describe, expect, it, vi } from "vitest";
import { scanPart, scanRecord } from "./scanService";
import { updateWorkOrderStatus } from "./workOrderService";

const backend = vi.hoisted(() => vi.fn<typeof fetch>());
vi.mock("@/integrations/supabase/client", async () => {
  const { createClient } = await vi.importActual<typeof import("@supabase/supabase-js")>("@supabase/supabase-js");
  return { supabase: createClient("https://test.supabase.co", "test", {
    auth: { persistSession: false }, global: { fetch: backend },
  }) };
});

it("acknowledges a queued Start for an already completed job without reopening it", async () => {
  const filteredStatuses: (string | null)[] = [];
  respond((_table, query) => {
    if (query.get("select") === "id,status") return [{ id, status: "completed" }];
    filteredStatuses.push(query.get("status"));
    return [];
  });
  expect(await updateWorkOrderStatus(id, "in_progress", "advance")).toEqual([{ id }]);
  expect(filteredStatuses).toEqual(["eq.pending"]);
});

const id = "abcdef01-0000-4000-9000-000000000001";
const origin = "https://maintenease.com";
const part = { id, name: "Belt", quantity_on_hand: 8, unit_of_measure: "ea" };

function respond(handler: (table: string, query: URLSearchParams) => object[]) {
  backend.mockImplementation(async (input) => {
    const url = new URL(String(input));
    return new Response(JSON.stringify(handler(url.pathname.split("/").pop()!, url.searchParams)), {
      headers: { "Content-Type": "application/json" },
    });
  });
}

beforeEach(() => { backend.mockReset(); });

describe("inventory and equipment barcode lookup", () => {
  it("resolves a part number literally, preserving punctuation and leading zeros", async () => {
    respond((table, query) => table === "parts" && query.get("part_number") === "eq.001,_%*(A)" ? [part] : []);
    expect(await scanRecord(" 001,_%*(A) ", origin)).toEqual({ kind: "part", id, part });
    expect(await scanPart("001,_%*(A)")).toEqual(part);
  });

  it("accepts a UUID without counting the same part twice", async () => {
    respond((table) => table === "parts" ? [part] : []);
    expect(await scanPart(id)).toEqual(part);
  });

  it("rejects duplicate catalog numbers and conflicting equipment labels", async () => {
    respond(() => [part, { ...part, id: "another-part" }]);
    await expect(scanPart("001")).rejects.toThrow(/multiple records/);
    respond((table) => table === "assets" ? [{ id: "asset-id" }] : [part]);
    await expect(scanRecord("001", origin)).rejects.toThrow(/multiple records/);
  });

  it("opens printed asset URLs and distinguishes work-order URLs", async () => {
    respond((_table, query) => query.get("id") === "eq." + id ? [{ id }] : []);
    expect(await scanRecord(origin + "/assets/" + id, origin)).toEqual({ kind: "asset", id });
    expect(await scanRecord("/work-orders/" + id, origin)).toEqual({ kind: "workOrder", id });
    await expect(scanRecord("https://elsewhere.example/assets/" + id, origin)).rejects.toThrow(/No matching/);
  });

  it("looks up generated setup-sheet short codes and escapes serial wildcards", async () => {
    respond((table, query) => table === "assets" && query.getAll("id").includes("gte.ABCDEF00-0000-0000-0000-000000000000")
      ? [{ id }] : []);
    expect(await scanRecord("AST-ABCDEF", origin)).toEqual({ kind: "asset", id });
    respond((table, query) => table === "assets" && query.get("serial_number") === "ilike.A\\_B\\%" ? [{ id }] : []);
    expect(await scanRecord("A_B%", origin)).toEqual({ kind: "asset", id });
  });
});
