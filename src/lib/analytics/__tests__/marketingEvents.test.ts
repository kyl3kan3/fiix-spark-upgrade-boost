import { beforeEach, describe, expect, it } from "vitest";
import {
  clearSignupAttribution,
  isTrackedMarketingSlug,
  marketingPageSlugFromPath,
  readSignupAttribution,
  storeSignupAttribution,
} from "../marketingEvents";

describe("marketing event coverage and attribution", () => {
  beforeEach(() => {
    clearSignupAttribution();
    window.history.replaceState({}, "", "/learn/cmms?utm_source=test");
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
