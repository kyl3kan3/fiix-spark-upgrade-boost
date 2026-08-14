import { describe, expect, it } from "vitest";
import { classifySeoPath, normalizeSeoPath, redirectForPath } from "@/lib/seoRouting";

describe("SEO route policy", () => {
  it.each([
    "/",
    "/pricing",
    "/mcp",
    "/solutions/asset-management-software",
    "/learn/preventive-maintenance",
    "/compare/maintenease-vs-fiix",
    "/templates",
    "/templates/maintenance-log-template",
    "/blog/reduce-unplanned-downtime",
  ])("marks %s as indexable", (path) => {
    expect(classifySeoPath(path)).toBe("indexable");
  });

  it.each([
    "/auth",
    "/forgot-password",
    "/feature/work-orders",
    "/r/acme-facilities",
    "/dashboard",
    "/assets/asset-123",
    "/admin/seo-index",
    "/settings/notifications",
  ])("marks %s as noindex", (path) => {
    expect(classifySeoPath(path)).toBe("noindex");
  });

  it.each(["/does-not-exist", "/solutions/too/many-segments", "/api/private"]) (
    "marks %s as not found",
    (path) => {
      expect(classifySeoPath(path)).toBe("not-found");
    },
  );

  it("normalizes duplicate and trailing slashes", () => {
    expect(normalizeSeoPath("pricing///")).toBe("/pricing");
  });

  it("maps legacy routes to one canonical destination", () => {
    expect(redirectForPath("/privacy-policy/")).toEqual({ location: "/privacy", status: 301 });
    expect(redirectForPath("/signup")).toEqual({ location: "/auth?signup=true", status: 302 });
    expect(redirectForPath("/pricing")).toBeNull();
  });
});
