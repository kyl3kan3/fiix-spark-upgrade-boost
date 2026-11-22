import { assertEquals } from "jsr:@std/assert@1";
import { handleMeterReading } from "./handler.ts";

const body = {
  meter_id: "122f4fa1-a004-4765-82ae-96b44bfd00bb", event_id: "pump-7-reading-581",
  reading_value: 1500, unit: "hrs", observed_at: "2026-11-22T10:00:00.123456-06:00",
};
const key = "mke_live_example";
const request = (payload: unknown, token = key) => new Request("https://example.test/meter-readings", {
  method: "POST", headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  body: JSON.stringify(payload),
});
const result = { reading_id: body.meter_id, replayed: false, work_orders_created: 1, work_orders_deferred: 0 };

Deno.test("submits the observation unchanged with a SHA-256 key digest", async () => {
  const response = await handleMeterReading(request(body), async (args) => {
    assertEquals(args._api_key_hash, "d9bd6bbe9af27defcbbba897ccd9769069e85da9336f83cb2e0ef45f1af02681");
    assertEquals(args._observed_at, body.observed_at);
    assertEquals(args._reading_value, 1500);
    assertEquals(args._notes, null);
    return { data: result, error: null };
  });
  assertEquals(response.status, 201);
  assertEquals(await response.json(), result);
});

Deno.test("rejects missing source identity, ambiguous dates, and malformed credentials", async () => {
  const unexpected = () => { throw new Error("Invalid requests should not enter the database"); };
  for (const invalid of [
    { ...body, meter_id: "unknown" }, { ...body, event_id: "" }, { ...body, unit: "" },
    { ...body, observed_at: "2026-11-22T10:00:00" }, { ...body, reading_value: -1 },
  ]) {
    assertEquals((await handleMeterReading(request(invalid), unexpected)).status, 422);
  }
  assertEquals((await handleMeterReading(request(body, "unrelated"), unexpected)).status, 401);
});

Deno.test("replays return 200 and database validation errors keep their status", async () => {
  const replay = await handleMeterReading(request(body), async () => ({ data: { ...result, replayed: true }, error: null }));
  assertEquals(replay.status, 200);
  for (const status of [401, 403, 404, 409, 422]) {
    const response = await handleMeterReading(request(body), async () => ({
      data: null, error: { code: `PT${status}`, message: "Rejected" },
    }));
    assertEquals(response.status, status);
  }
});

Deno.test("limits payload bytes even when Content-Length is missing or understated", async () => {
  const unexpected = () => { throw new Error("Oversized requests should not enter the database"); };
  for (const length of [null, "1", "16385"]) {
    const headers = new Headers({ Authorization: `Bearer ${key}` });
    if (length !== null) headers.set("Content-Length", length);
    const stream = new ReadableStream<Uint8Array>({
      start(controller) {
        controller.enqueue(new Uint8Array(8192));
        controller.enqueue(new Uint8Array(8193));
        controller.close();
      },
    });
    const req = new Request("https://example.test/meter-readings", { method: "POST", headers, body: stream });
    assertEquals((await handleMeterReading(req, unexpected)).status, 413);
  }
});
