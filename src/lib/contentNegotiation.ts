import { normalizeSeoPath } from "./seoRouting";

export const MARKDOWN_MEDIA_TYPE = "text/markdown";

/**
 * Content negotiation is opt-in. Browser Accept headers commonly include
 * broad wildcards, so only an explicit text/markdown media range selects the
 * Markdown representation.
 */
export function acceptsMarkdown(acceptHeader: string | null): boolean {
  if (!acceptHeader) return false;

  return acceptHeader.split(",").some((part) => {
    const [rawMediaType, ...parameters] = part.trim().toLowerCase().split(";");
    if (rawMediaType !== MARKDOWN_MEDIA_TYPE) return false;

    const quality = parameters
      .map((parameter) => parameter.trim())
      .find((parameter) => parameter.startsWith("q="));
    if (!quality) return true;

    const value = Number.parseFloat(quality.slice(2));
    return Number.isFinite(value) && value > 0;
  });
}

export function markdownPathForPage(pathname: string): string | null {
  const path = normalizeSeoPath(pathname);
  if (/\.[a-z0-9]+$/i.test(path)) return null;
  return path === "/" ? "/index.md" : `${path}.md`;
}

export function htmlPathForMarkdown(pathname: string): string | null {
  const path = normalizeSeoPath(pathname);
  if (path === "/index.md") return "/";
  return path.endsWith(".md") ? path.slice(0, -3) || "/" : null;
}

export function appendVary(headers: Headers, value: string): void {
  const current = headers.get("Vary")
    ?.split(",")
    .map((part) => part.trim())
    .filter(Boolean) ?? [];

  if (!current.some((part) => part.toLowerCase() === value.toLowerCase())) {
    current.push(value);
  }
  headers.set("Vary", current.join(", "));
}

const CRAWLER_PATTERNS = [
  ["googlebot", /googlebot/i],
  ["google-inspectiontool", /google-inspectiontool/i],
  ["bingbot", /bingbot/i],
  ["gptbot", /gptbot/i],
  ["chatgpt-user", /chatgpt-user/i],
  ["oai-searchbot", /oai-searchbot/i],
  ["claudebot", /claudebot|claude-web/i],
  ["perplexitybot", /perplexitybot/i],
  ["applebot", /applebot/i],
] as const;

/** Returns a coarse label only; raw user agents and IP addresses are not logged. */
export function identifyCrawler(userAgent: string | null): string | null {
  if (!userAgent) return null;
  return CRAWLER_PATTERNS.find(([, pattern]) => pattern.test(userAgent))?.[0] ?? null;
}
