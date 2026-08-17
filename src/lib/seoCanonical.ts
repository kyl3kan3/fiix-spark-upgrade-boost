export const SITE_ORIGIN = "https://maintenease.com";

const INDEXED_STATIC_PATHS = new Set([
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
]);

const INDEXED_DETAIL_PATH =
  /^\/(?:solutions|learn|compare|templates|blog)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

function normalizePathname(pathname: string): string | null {
  if (!pathname.startsWith("/") || pathname.includes("?") || pathname.includes("#")) {
    return null;
  }

  const normalized = pathname.replace(/\/+$/, "");
  return normalized || "/";
}

export function canonicalUrlForPath(pathname: string): string | null {
  const normalizedPath = normalizePathname(pathname);
  if (
    !normalizedPath ||
    (!INDEXED_STATIC_PATHS.has(normalizedPath) &&
      !INDEXED_DETAIL_PATH.test(normalizedPath))
  ) {
    return null;
  }

  // /landing is the paid-acquisition variant of the homepage. Keep it
  // available to campaigns while consolidating its search signals to `/`.
  if (normalizedPath === "/landing") return `${SITE_ORIGIN}/`;

  return normalizedPath === "/"
    ? `${SITE_ORIGIN}/`
    : `${SITE_ORIGIN}${normalizedPath}`;
}
