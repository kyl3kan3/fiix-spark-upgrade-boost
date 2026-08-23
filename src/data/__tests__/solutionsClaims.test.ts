import { describe, expect, it } from "vitest";
import { solutions } from "@/data/solutions";

const publishedCopy = JSON.stringify(solutions);

describe("solution-page product claims", () => {
  it("does not advertise capabilities that are not verified in the product", () => {
    const unsupportedClaims = [
      "Auto-assign by asset",
      "offline support",
      "Holiday blackouts",
      "Telematics-fed odometer",
      "can feed odometer and engine-hour readings",
      "lightweight driver role at a reduced per-seat cost",
      "gives every asset a unique QR code",
      "Custody changes, transfers, and disposals",
      "straight-line depreciation reports are built in",
      "supports common BMS triggers via webhooks",
      "COI tracking, scoped POs",
      "without captchas",
      "your-team.maintenease.com",
    ];

    for (const claim of unsupportedClaims) {
      expect(publishedCopy).not.toContain(claim);
    }
  });

  it("states important scope boundaries alongside supported workflows", () => {
    const fleet = solutions.find((solution) => solution.slug === "fleet-maintenance-software");
    const portal = solutions.find((solution) => solution.slug === "maintenance-request-portal");
    const tracking = solutions.find((solution) => solution.slug === "asset-tracking-software");

    expect(fleet?.intro).toContain("does not claim native telematics feeds");
    expect(portal?.features.map((feature) => feature.body).join(" ")).toContain("Turnstile");
    expect(portal?.faqs.map((faq) => faq.a).join(" ")).toContain("not a substitute for emergency services");
    expect(tracking?.features.map((feature) => feature.body).join(" ")).toContain("Code 128");
  });

  it("publishes a real last-modified date for every solution page", () => {
    for (const solution of solutions) {
      expect(solution.updated).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
