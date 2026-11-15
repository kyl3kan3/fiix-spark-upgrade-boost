import { describe, it, expect, vi, beforeEach } from "vitest";
import { generateWorkOrderSummary } from "../workOrderSummaryService";

const getSession = vi.hoisted(() => vi.fn());
vi.mock("@/integrations/supabase/client", () => ({ supabase: { auth: { getSession } } }));

describe("work-order summaries", () => {
  beforeEach(() => { vi.restoreAllMocks(); getSession.mockResolvedValue({ data: { session: { access_token: "test-session" } } }); });
  it("requires a signed-in user before sending a request", async () => {
    getSession.mockResolvedValue({ data: { session: null } });
    const fetcher = vi.spyOn(globalThis, "fetch");
    await expect(generateWorkOrderSummary("order-1", new AbortController().signal)).rejects.toThrow("sign in");
    expect(fetcher).not.toHaveBeenCalled();
  });
  it("sends only the work-order ID and reads the streamed summary", async () => {
    const bytes = new TextEncoder().encode('data: {"type":"text-delta","delta":"Issue: Pump leak\\nPriority: high\\nKey details: Pump A"}\n\ndata: [DONE]\n');
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(new ReadableStream({ start(c) { c.enqueue(bytes); c.close(); } })));
    const summary = await generateWorkOrderSummary("order-1", new AbortController().signal);
    expect(summary).toBe("Issue: Pump leak\nPriority: high\nKey details: Pump A");
    expect(JSON.parse(String(fetcher.mock.calls[0]?.[1]?.body))).toEqual({ workOrderId: "order-1" });
  });
  it("surfaces credit errors without retrying", async () => {
    const fetcher = vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({ error: "Insufficient credits" }), { status: 402 }));
    await expect(generateWorkOrderSummary("order-1", new AbortController().signal)).rejects.toThrow("Insufficient credits");
    expect(fetcher).toHaveBeenCalledTimes(1);
  });
});