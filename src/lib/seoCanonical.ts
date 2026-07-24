export const SITE_ORIGIN = "https://maintenease.com";

const INDEXED_STATIC_PATHS = new Set([
  "/",
  "/landing",
  "/maintenance-simplified",
  "/pricing",
  "/features",
  "/solutions",
  "/learn",
  "/auth",
  "/privacy",
  "/terms",
  "/refund-policy",
  "/sms-opt-in",
  "/blog",
  "/compare",
  "/cmms-cost-calculator",
]);

const INDEXED_DETAIL_PATH =
  /^\/(?:solutions|learn|compare|blog)\/[a-z0-9]+(?:-[a-z0-9]+)*$/;

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

  return normalizedPath === "/"
    ? `${SITE_ORIGIN}/`
    : `${SITE_ORIGIN}${normalizedPath}`;
}
