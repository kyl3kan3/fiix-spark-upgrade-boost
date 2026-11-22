import { corsHeadersForRequest, handleCorsPreflight } from "../_shared/cors.ts";

type IngestArgs = {
  _api_key_hash: string;
  _event_id: string;
  _meter_id: string;
  _reading_value: number;
  _unit: string;
  _observed_at: string;
  _notes: string | null;
};
type Ingest = (args: IngestArgs) => PromiseLike<{
  data: { reading_id: string; replayed: boolean; work_orders_created: number; work_orders_deferred: number } | null;
  error: { code: string; message: string } | null;
}>;

const uuid = /^[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i;
const timestamp = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,6})?(?:Z|[+-]\d{2}:\d{2})$/;
const maxBodyBytes = 16 * 1024;

async function readJsonBody(req: Request) {
  if (Number(req.headers.get("Content-Length")) > maxBodyBytes) return { tooLarge: true } as const;
  const reader = req.body?.getReader();
  if (!reader) return { value: null };
  const bytes = new Uint8Array(maxBodyBytes);
  let size = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (size + value.length > maxBodyBytes) {
        await reader.cancel();
        return { tooLarge: true } as const;
      }
      bytes.set(value, size);
      size += value.length;
    }
    return { value: JSON.parse(new TextDecoder("utf-8", { fatal: true }).decode(bytes.subarray(0, size))) };
  } catch {
    return { value: null };
  } finally {
    reader.releaseLock();
  }
}

export async function handleMeterReading(req: Request, ingest: Ingest): Promise<Response> {
  const preflight = handleCorsPreflight(req);
  if (preflight) return preflight;
  const headers = { ...corsHeadersForRequest(req), "Content-Type": "application/json", "Cache-Control": "no-store" };
  const json = (status: number, body: unknown) => new Response(JSON.stringify(body), { status, headers });
  if (req.method !== "POST") return json(405, { error: "Use POST" });
  const key = /^Bearer (mke_live_[a-zA-Z0-9]{1,40})$/i.exec(req.headers.get("Authorization") ?? "")?.[1];
  if (!key) return json(401, { error: "Supply a Business API key in the Authorization header" });

  const parsed = await readJsonBody(req);
  if (parsed.tooLarge) return json(413, { error: "Reading payload exceeds 16 KiB" });
  const body = parsed.value;
  if (!body || typeof body !== "object" || Array.isArray(body)) return json(400, { error: "Expected a JSON object" });
  const { meter_id, event_id, reading_value, unit, observed_at, notes = null } = body;
  if (typeof meter_id !== "string" || !uuid.test(meter_id)) return json(422, { error: "Invalid meter_id" });
  if (typeof event_id !== "string" || !event_id.trim() || event_id !== event_id.trim() || event_id.length > 128) {
    return json(422, { error: "Supply an event_id of 1 to 128 characters" });
  }
  if (typeof reading_value !== "number" || !Number.isFinite(reading_value) || reading_value < 0) {
    return json(422, { error: "reading_value must be a finite, nonnegative number" });
  }
  if (typeof unit !== "string" || !unit.trim() || unit.length > 64) return json(422, { error: "Invalid meter unit" });
  if (typeof observed_at !== "string" || !timestamp.test(observed_at) || !Number.isFinite(Date.parse(observed_at))) {
    return json(422, { error: "observed_at must be an ISO timestamp with a time zone" });
  }
  if (notes !== null && (typeof notes !== "string" || notes.length > 2000)) return json(422, { error: "Invalid notes" });
  try {
    const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(key));
    const hash = Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
    const { data, error } = await ingest({
      _api_key_hash: hash, _meter_id: meter_id, _event_id: event_id, _reading_value: reading_value,
      _observed_at: observed_at, _unit: unit, _notes: notes,
    });
    if (error) {
      if (/^PT(401|403|404|409|422)$/.test(error.code)) return json(Number(error.code.slice(2)), { error: error.message });
      if (["22007", "22008"].includes(error.code)) return json(422, { error: "Invalid observation timestamp" });
      return json(500, { error: "Could not record reading" });
    }
    if (!data) return json(500, { error: "Could not record reading" });
    return json(data.replayed ? 200 : 201, data);
  } catch {
    return json(500, { error: "Could not record reading" });
  }
}
