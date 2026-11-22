import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { hasWindowLoadCompleted, resetWindowLoadGateForTests } from "@/lib/deferAuthBootstrap";
import {
  clearSignupAttribution,
  isTrackedMarketingSlug,
  marketingPageSlugFromPath,
  readSignupAttribution,
  getPendingMarketingEventInsertsForTests,
  resetDeferredMarketingEventQueueForTests,
  setMarketingPageEventInserterForTests,
  storeSignupAttribution,
  trackMarketingEvent,
} from "../marketingEvents";

let idleTask: (() => void) | undefined;

vi.mock("@/lib/deferAuthBootstrap", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/deferAuthBootstrap")>();
  return {
    ...actual,
    scheduleIdleTask: (task: () => void) => {
      idleTask = task;
      return () => {
        idleTask = undefined;
      };
    },
  };
});

describe("marketing event coverage and attribution", () => {
  beforeEach(() => {
    clearSignupAttribution();
    resetDeferredMarketingEventQueueForTests();
    idleTask = undefined;
    window.history.replaceState({}, "", "/learn/cmms?utm_source=test");
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://example.com/landing",
    });
  });

  afterEach(() => {
    resetDeferredMarketingEventQueueForTests();
  });

  it("covers new normalized SEO page slugs without a manual allowlist", () => {
    expect(isTrackedMarketingSlug("work-order-software")).toBe(true);
    expect(isTrackedMarketingSlug("cmms-for-chatgpt")).toBe(true);
    expect(isTrackedMarketingSlug("not/a/slug")).toBe(false);
  });

  it("derives stable page slugs from canonical paths", () => {
    expect(marketingPageSlugFromPath("/")).toBe("home");
    expect(marketingPageSlugFromPath("/solutions/work-order-software/")).toBe("work-order-software");
    expect(marketingPageSlugFromPath("/learn/cmms.md")).toBe("cmms");
  });

  it("persists source page, CTA location, and campaign through sign-up", () => {
    storeSignupAttribution({
      sourcePageSlug: "cmms",
      sourcePath: "/learn/cmms?utm_source=test",
      ctaLocation: "article-cta",
    });

    expect(readSignupAttribution()).toMatchObject({
      sourcePageSlug: "cmms",
      sourcePath: "/learn/cmms?utm_source=test",
      ctaLocation: "article-cta",
      campaign: { utm_source: "test" },
    });
  });
});

describe("trackMarketingEvent deferred persistence", () => {
  beforeEach(() => {
    resetDeferredMarketingEventQueueForTests();
    setMarketingPageEventInserterForTests(vi.fn().mockResolvedValue(undefined));
    idleTask = undefined;
    window.history.replaceState({}, "", "/");
    Object.defineProperty(document, "referrer", {
      configurable: true,
      value: "https://example.com/home",
    });
  });

  afterEach(() => {
    resetDeferredMarketingEventQueueForTests();
  });

  it("captures page_url and referrer synchronously before a same-tab navigation", async () => {
    const sourceHref = window.location.href;

    await trackMarketingEvent({
      eventType: "cta_click",
      pageSlug: "home",
      metadata: { cta: "start_free_trial" },
    });

    window.history.replaceState({}, "", "/auth");
    expect(window.location.href).not.toBe(sourceHref);

    const [pending] = getPendingMarketingEventInsertsForTests();
    expect(pending).toMatchObject({
      event_type: "cta_click",
      page_slug: "home",
      page_url: sourceHref,
      referrer: "https://example.com/home",
    });
  });

  it("flushes pending inserts on pagehide without waiting for idle", async () => {
    const insert = vi.fn().mockResolvedValue(undefined);
    setMarketingPageEventInserterForTests(insert);

    await trackMarketingEvent({ eventType: "page_view", pageSlug: "home" });

    expect(getPendingMarketingEventInsertsForTests()).toHaveLength(1);
    expect(idleTask).toBeDefined();

    window.dispatchEvent(new Event("pagehide"));
    await Promise.resolve();
    await Promise.resolve();

    expect(getPendingMarketingEventInsertsForTests()).toHaveLength(0);
    expect(insert).toHaveBeenCalledTimes(1);
    expect(insert).toHaveBeenCalledWith(
      expect.objectContaining({
        event_type: "page_view",
        page_slug: "home",
        referrer: "https://example.com/home",
      }),
    );
  });

  it("does not flush on hide until window load even if readyState is already complete", async () => {
    const readyState = Object.getOwnPropertyDescriptor(document, "readyState");
    Object.defineProperty(document, "readyState", {
      configurable: true,
      get: () => "complete",
    });

    const insert = vi.fn().mockResolvedValue(undefined);
    setMarketingPageEventInserterForTests(insert);
    resetWindowLoadGateForTests();
    expect(hasWindowLoadCompleted()).toBe(false);

    try {
      await trackMarketingEvent({ eventType: "page_view", pageSlug: "home" });
      window.dispatchEvent(new Event("pagehide"));
      await Promise.resolve();

      expect(getPendingMarketingEventInsertsForTests()).toHaveLength(1);
      expect(insert).not.toHaveBeenCalled();

      window.dispatchEvent(new Event("load"));
      expect(hasWindowLoadCompleted()).toBe(true);

      idleTask?.();
      await Promise.resolve();

      expect(getPendingMarketingEventInsertsForTests()).toHaveLength(0);
      expect(insert).toHaveBeenCalledTimes(1);
    } finally {
      if (readyState) {
        Object.defineProperty(document, "readyState", readyState);
      }
    }
  });
});
