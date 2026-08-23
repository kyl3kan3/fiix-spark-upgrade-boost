import { describe, expect, it } from "vitest";
import { STATIC_SITEMAP_ENTRIES } from "@/data/sitemapEntries";

describe("static sitemap entries", () => {
  it("contains each canonical route exactly once", () => {
    const paths = STATIC_SITEMAP_ENTRIES.map((entry) => entry.path);

    expect(paths.length).toBeGreaterThanOrEqual(50);
    expect(new Set(paths).size).toBe(paths.length);
    expect(paths).not.toContain("/landing");
  });

  it.each([
    "/mcp",
    "/support",
    "/maintenance-simplified",
    "/solutions/preventive-maintenance-software",
    "/solutions/work-order-software",
    "/solutions/maintenance-request-portal",
    "/solutions/asset-tracking-software",
    "/learn/deferred-maintenance",
    "/templates",
    "/templates/maintenance-log-template",
    "/templates/preventive-maintenance-checklist",
    "/templates/work-order-template",
    "/templates/preliminary-hazard-analysis-template",
    "/learn/infrared-thermography-inspection",
    "/tools/maintenance-sop-generator",
    "/tools/root-cause-fishbone-generator",
  ])("publishes an evidence-backed lastmod for %s", (path) => {
    const entry = STATIC_SITEMAP_ENTRIES.find((candidate) => candidate.path === path);

    expect(entry?.lastmod).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
