import { describe, expect, it } from "vitest";
import { PROTECTED_ROUTES } from "../routeManifest";
import { NAV_ITEMS } from "@/components/shell/navConfig";

/** Does a concrete href satisfy a route pattern (treating :params as wildcards)? */
function matchesPattern(href: string, pattern: string): boolean {
  const h = href.split("/");
  const p = pattern.split("/");
  if (h.length !== p.length) return false;
  return p.every((seg, i) => seg.startsWith(":") || seg === h[i]);
}

describe("route manifest ↔ nav consistency", () => {
  it("registers no duplicate route paths", () => {
    const paths = PROTECTED_ROUTES.map((r) => r.path);
    expect(new Set(paths).size).toBe(paths.length);
  });

  it("resolves every nav link to a registered protected route", () => {
    const unresolved = NAV_ITEMS.filter(
      (item) => !PROTECTED_ROUTES.some((route) => matchesPattern(item.href, route.path)),
    ).map((item) => `${item.label} → ${item.href}`);
    expect(unresolved).toEqual([]);
  });

  it("gives every registered route a non-empty component", () => {
    for (const route of PROTECTED_ROUTES) {
      expect(route.component, `route ${route.path} has no component`).toBeTruthy();
    }
  });
});
