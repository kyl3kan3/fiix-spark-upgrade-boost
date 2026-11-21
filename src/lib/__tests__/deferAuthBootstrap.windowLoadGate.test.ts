import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

describe("window load gate at fresh module init", () => {
  let readyStateDescriptor: PropertyDescriptor | undefined;
  let getEntriesByTypeSpy:
    | { mockRestore: () => void }
    | undefined;

  beforeEach(() => {
    readyStateDescriptor = Object.getOwnPropertyDescriptor(document, "readyState");
    Object.defineProperty(document, "readyState", {
      configurable: true,
      get: () => "complete",
    });
    getEntriesByTypeSpy = vi.spyOn(performance, "getEntriesByType").mockReturnValue([
      { loadEventEnd: 0 } as PerformanceNavigationTiming,
    ]);
  });

  afterEach(async () => {
    getEntriesByTypeSpy?.mockRestore();
    if (readyStateDescriptor) {
      Object.defineProperty(document, "readyState", readyStateDescriptor);
    }
    vi.resetModules();
    await import("@/lib/deferAuthBootstrap");
    await import("@/lib/analytics/marketingEvents");
  });

  it("defers hide flush and scheduleIdleTask until load when readyState is ahead of load", async () => {
    vi.resetModules();
    const deferAuth = await import("@/lib/deferAuthBootstrap");
    const marketingEvents = await import("@/lib/analytics/marketingEvents");

    expect(deferAuth.hasWindowLoadCompleted()).toBe(false);

    const idleTask = vi.fn();
    deferAuth.scheduleIdleTask(idleTask);
    expect(idleTask).not.toHaveBeenCalled();

    const insert = vi.fn().mockResolvedValue(undefined);
    marketingEvents.resetDeferredMarketingEventQueueForTests();
    marketingEvents.setMarketingPageEventInserterForTests(insert);

    window.history.replaceState({}, "", "/");
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://example.com/home",
    });

    await marketingEvents.trackMarketingEvent({ eventType: "page_view", pageSlug: "home" });
    window.dispatchEvent(new Event("pagehide"));
    await Promise.resolve();

    expect(insert).not.toHaveBeenCalled();
    expect(marketingEvents.getPendingMarketingEventInsertsForTests()).toHaveLength(1);

    window.dispatchEvent(new Event("load"));
    expect(deferAuth.hasWindowLoadCompleted()).toBe(true);

    await vi.waitFor(() => expect(idleTask).toHaveBeenCalledTimes(1), { timeout: 3000 });
    await vi.waitFor(() => expect(insert).toHaveBeenCalledTimes(1), { timeout: 3000 });
  });
});