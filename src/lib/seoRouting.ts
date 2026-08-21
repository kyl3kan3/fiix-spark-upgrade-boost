export type SeoPathKind = "indexable" | "noindex" | "not-found";

export type SeoRedirect = {
  location: string;
  status: 301 | 302;
};

const INDEXABLE_ROUTES = new Set([
  "/",
  "/landing",
  "/maintenance-simplified",
  "/facility-management",
  "/pricing",
  "/features",
  "/solutions",
  "/learn",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/sms-opt-in",
  "/blog",
  "/compare",
  "/templates",
  "/mcp",
  "/cmms-cost-calculator",
  "/tools/maintenance-sop-generator",
  "/tools/root-cause-fishbone-generator",
  "/support",
  "/about",
  "/editorial-policy",
]);

const NOINDEX_ROUTES = new Set([
  "/auth",
  "/forgot-password",
  "/reset-password",
  "/unsubscribe",
  "/.lovable/oauth/consent",
]);

const NOINDEX_PREFIXES = [
  "/requests",
  "/dashboard",
  "/vendors",
  "/assets",
  "/work-orders",
  "/inspections",
  "/checklists",
  "/admin",
  "/notifications",
  "/settings",
  "/calendar",
  "/maintenance",
  "/predictive-maintenance",
  "/self-healing",
  "/cost-tracking",
  "/onboarding",
  "/power-usage",
  "/assistant",
  "/guided-setup",
  "/building-viewer",
  "/import",
  "/team",
  "/locations",
  "/profile",
  "/help",
  "/chat",
  "/reports",
  "/billing",
  "/automations",
  "/api-keys",
  "/sso",
  "/setup",
  "/team-setup",
  "/company-setup",
] as const;

const REDIRECTS: Record<string, SeoRedirect> = {
  "/index": { location: "/", status: 301 },
  "/privacy-policy": { location: "/privacy", status: 301 },
  "/terms-of-service": { location: "/terms", status: 301 },
  "/refunds": { location: "/refund-policy", status: 301 },
  "/sms": { location: "/sms-opt-in", status: 301 },
  "/login": { location: "/auth", status: 302 },
  "/signup": { location: "/auth?signup=true", status: 302 },
  "/blog/how-to-build-an-industrial-preventive-maintenance-plan-in-2026": {
    location: "/learn/preventive-maintenance",
    status: 301,
  },
};

const GENERATED_INDEXABLE_ROUTE_SET = new Set<string>(GENERATED_INDEXABLE_ROUTES);
const PRIVATE_PUBLIC_ROUTE = /^\/(?:feature|r)\/[^/]+$/;

export function normalizeSeoPath(pathname: string): string {
  const withLeadingSlash = pathname.startsWith("/") ? pathname : `/${pathname}`;
  const withoutDuplicateSlashes = withLeadingSlash.replace(/\/{2,}/g, "/");
  return withoutDuplicateSlashes === "/" ? "/" : withoutDuplicateSlashes.replace(/\/+$/, "");
}

export function redirectForPath(pathname: string): SeoRedirect | null {
  return REDIRECTS[normalizeSeoPath(pathname)] ?? null;
}

export function classifySeoPath(pathname: string): SeoPathKind {
  const path = normalizeSeoPath(pathname);

  if (INDEXABLE_ROUTES.has(path) || GENERATED_INDEXABLE_ROUTE_SET.has(path)) return "indexable";
  if (NOINDEX_ROUTES.has(path) || PRIVATE_PUBLIC_ROUTE.test(path)) return "noindex";
  if (NOINDEX_PREFIXES.some((prefix) => path === prefix || path.startsWith(`${prefix}/`))) {
    return "noindex";
  }
  return "not-found";
}
import { GENERATED_INDEXABLE_ROUTES } from "../data/generatedIndexableRoutes";
