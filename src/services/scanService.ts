import { supabase } from "@/integrations/supabase/client";
import type { Part } from "@/types/parts";

export type ScannedPart = Pick<Part, "id" | "name" | "quantity_on_hand" | "unit_of_measure">;
type ScanMatch =
  | { kind: "asset" | "workOrder"; id: string }
  | { kind: "part"; id: string; part: ScannedPart };

const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

async function rows<T>(query: PromiseLike<{ data: T[] | null; error: unknown }>) {
  const { data, error } = await query;
  if (error) throw new Error("Could not look up this code. Try again.");
  return data ?? [];
}

function uniqueMatch<T extends { id: string; kind: string }>(matches: T[]): T {
  const unique = new Map(matches.map((match) => [`${match.kind}/${match.id}`, match]));
  if (unique.size === 0) throw new Error("No matching record found.");
  if (unique.size > 1) throw new Error("This code matches multiple records. Enter the record ID or use a unique label.");
  return unique.values().next().value!;
}

async function partMatches(value: string) {
  const parts = () => supabase.from("parts").select("id, name, quantity_on_hand, unit_of_measure");
  const queries = [rows(parts().eq("part_number", value).limit(2))];
  if (uuid.test(value)) queries.push(rows(parts().eq("id", value)));
  return (await Promise.all(queries)).flat().map((part) => ({ kind: "part" as const, id: part.id, part }));
}

export async function scanPart(value: string): Promise<ScannedPart> {
  return uniqueMatch(await partMatches(value.trim())).part;
}

function labelRoute(value: string, origin: string) {
  if (!/^(https?:\/\/|\/)/i.test(value)) return null;
  try {
    const url = new URL(value, origin);
    if (url.origin !== origin && url.origin !== "https://maintenease.com") return null;
    const segments = url.pathname.replace(/\/$/, "").split("/");
    if (segments.length !== 3 || !uuid.test(segments[2])) return null;
    if (segments[1] === "assets" || segments[1] === "work-orders") {
      return { resource: segments[1], id: segments[2] };
    }
  } catch {
    // Non-URL serials and part numbers are still valid lookup values.
  }
  return null;
}

export async function scanRecord(code: string, origin: string): Promise<ScanMatch> {
  const value = code.trim();
  const assets = () => supabase.from("assets").select("id");
  const workOrders = () => supabase.from("work_orders").select("id");
  const route = labelRoute(value, origin);
  if (route) {
    const isAsset = route.resource === "assets";
    const found = await rows((isAsset ? assets() : workOrders()).eq("id", route.id));
    return uniqueMatch(found.map(({ id }) => ({ kind: isAsset ? "asset" as const : "workOrder" as const, id })));
  }

  // Printed setup sheets uppercase serials. Escape LIKE wildcards; PostgREST
  // also treats '*' as a wildcard, so use exact equality for literal asterisks.
  const serial = value.includes("*")
    ? assets().eq("serial_number", value)
    : assets().ilike("serial_number", value.replace(/[\\%_]/g, "\\$&"));
  const assetQueries = [rows(serial.limit(2))];
  if (uuid.test(value)) assetQueries.push(rows(assets().eq("id", value)));
  // Setup sheets for assets without a serial use AST- plus six UUID digits.
  const shortId = /^AST-([0-9a-f]{6})$/i.exec(value)?.[1];
  if (shortId) {
    assetQueries.push(rows(assets()
      .gte("id", shortId + "00-0000-0000-0000-000000000000")
      .lte("id", shortId + "ff-ffff-ffff-ffff-ffffffffffff").limit(2)));
  }
  const [assetGroups, orders, parts] = await Promise.all([
    Promise.all(assetQueries),
    uuid.test(value) ? rows(workOrders().eq("id", value)) : [],
    partMatches(value),
  ]);
  return uniqueMatch<ScanMatch>([
    ...assetGroups.flat().map(({ id }) => ({ kind: "asset" as const, id })),
    ...orders.map(({ id }) => ({ kind: "workOrder" as const, id })),
    ...parts,
  ]);
}
