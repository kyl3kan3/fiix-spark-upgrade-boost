import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.7";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-ingest-token",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const MAX_ROWS = 1000;
// Per-token rate limit: up to this many requests per rolling window.
const RATE_MAX_PER_WINDOW = 120;
const RATE_WINDOW_SECONDS = 60;

function json(status: number, body: unknown, extraHeaders: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json", ...extraHeaders },
  });
}

function toNum(v: unknown): number | null {
  const n = typeof v === "string" ? Number(v) : typeof v === "number" ? v : NaN;
  return Number.isFinite(n) ? n : null;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "POST") return new Response("Only POST allowed", { status: 405, headers: corsHeaders });

  try {
    const token = req.headers.get("x-ingest-token");
    if (!token) return json(401, { error: "Missing x-ingest-token header." });

    const admin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    );

    // Atomically validate the token, advance its rate-limit window, and stamp
    // last_used_at. Empty result => unknown token; allowed=false => over budget.
    const { data: consumed, error: tokenErr } = await admin.rpc("consume_energy_ingest_token", {
      _token: token,
      _max_per_window: RATE_MAX_PER_WINDOW,
      _window_seconds: RATE_WINDOW_SECONDS,
    });
    if (tokenErr) {
      console.error("Token lookup error:", tokenErr);
      return json(500, { error: "Lookup failed." });
    }
    const tokenRow = Array.isArray(consumed) ? consumed[0] : consumed;
    if (!tokenRow?.company_id) return json(403, { error: "Invalid ingest token." });
    if (!tokenRow.allowed) {
      return json(
        429,
        { error: `Rate limit exceeded (max ${RATE_MAX_PER_WINDOW} requests per ${RATE_WINDOW_SECONDS}s).` },
        { "Retry-After": String(RATE_WINDOW_SECONDS) },
      );
    }

    const body = await req.json().catch(() => null);
    // deno-lint-ignore no-explicit-any
    const b = body as any;
    const list: unknown[] = Array.isArray(b)
      ? b
      : Array.isArray(b?.readings)
        ? b.readings
        : b && typeof b === "object"
          ? [b]
          : [];

    if (list.length === 0) return json(400, { error: "No readings provided." });
    if (list.length > MAX_ROWS) return json(413, { error: `Too many readings (max ${MAX_ROWS}).` });

    const errors: string[] = [];
    const rows = [];
    for (let i = 0; i < list.length; i++) {
      // deno-lint-ignore no-explicit-any
      const r = (list[i] ?? {}) as any;
      const kwh = toNum(r.kwh);
      if (kwh === null || kwh < 0) {
        errors.push(`Reading ${i + 1}: invalid kwh.`);
        continue;
      }
      const cost = toNum(r.cost);
      const rawDate = typeof r.reading_date === "string" ? r.reading_date : "";
      const parsed = rawDate ? new Date(rawDate) : new Date();
      const reading_date = Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
      const currency =
        typeof r.currency === "string" && r.currency.trim()
          ? r.currency.trim().toUpperCase().slice(0, 3)
          : "USD";
      const meter_label =
        typeof r.meter_label === "string" && r.meter_label.trim() ? r.meter_label.trim() : null;
      // Optional idempotency key: retries with the same external_id dedupe.
      const external_id =
        typeof r.external_id === "string" && r.external_id.trim()
          ? r.external_id.trim()
          : typeof r.id === "string" && r.id.trim()
            ? r.id.trim()
            : null;

      rows.push({
        company_id: tokenRow.company_id,
        kwh,
        cost: cost !== null && cost >= 0 ? cost : null,
        currency,
        reading_date,
        meter_label,
        external_id,
        source: "integration",
      });
    }

    if (rows.length === 0) return json(400, { error: "No valid readings.", errors });

    // Upsert (ignore duplicates) on (company_id, external_id) so retried POSTs are
    // idempotent. Rows without an external_id carry NULL, which never conflicts.
    const { data: insertedRows, error: insErr } = await admin
      .from("energy_readings")
      .upsert(rows, { onConflict: "company_id,external_id", ignoreDuplicates: true })
      .select("id");
    if (insErr) {
      console.error("Insert error:", insErr);
      return json(500, { error: "Insert failed." });
    }

    const inserted = insertedRows?.length ?? 0;
    return json(200, {
      inserted,
      deduped: rows.length - inserted,
      skipped: errors.length,
      errors,
    });
  } catch (e) {
    console.error("ingest-energy error:", e);
    return json(500, { error: "Something went wrong." });
  }
});
