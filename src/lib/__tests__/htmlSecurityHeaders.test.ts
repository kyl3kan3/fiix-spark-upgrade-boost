import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { CONTENT_SECURITY_POLICY, HTML_SECURITY_HEADERS } from "../htmlSecurityHeaders";

const ROOT = join(import.meta.dirname, "../../..");

function parseNetlifyHeaders(filePath: string): Map<string, Record<string, string>> {
  const sections = new Map<string, Record<string, string>>();
  let currentPath: string | null = null;
  let current: Record<string, string> = {};

  for (const line of readFileSync(filePath, "utf8").split("\n")) {
    if (line.startsWith("#") || line.trim() === "") continue;
    if (!line.startsWith(" ")) {
      if (currentPath) sections.set(currentPath, current);
      currentPath = line.trim();
      current = {};
      continue;
    }
    const separator = line.indexOf(":");
    if (separator === -1) continue;
    const key = line.slice(0, separator).trim();
    const value = line.slice(separator + 1).trim();
    current[key] = value;
  }
  if (currentPath) sections.set(currentPath, current);
  return sections;
}

describe("htmlSecurityHeaders", () => {
  it("includes a conservative CSP with required third parties", () => {
    expect(CONTENT_SECURITY_POLICY).toContain("default-src 'self'");
    expect(CONTENT_SECURITY_POLICY).toContain("https://www.googletagmanager.com");
    expect(CONTENT_SECURITY_POLICY).toContain("https://datafa.st");
    expect(CONTENT_SECURITY_POLICY).toContain("https://wwgljhpuulhljumrhscg.supabase.co");
    expect(CONTENT_SECURITY_POLICY).toContain("frame-ancestors 'none'");
  });

  it("keeps vercel.json route headers aligned with the shared module", () => {
    const vercel = JSON.parse(readFileSync(join(ROOT, "vercel.json"), "utf8")) as {
      routes: Array<{ src?: string; headers?: Record<string, string>; continue?: boolean }>;
    };
    const securityRoute = vercel.routes.find(
      (route) => route.continue && route.headers?.["Content-Security-Policy"],
    );
    expect(securityRoute).toBeTruthy();
    for (const [key, value] of Object.entries(HTML_SECURITY_HEADERS)) {
      expect(securityRoute?.headers?.[key]).toBe(value);
    }
  });

  it("keeps public/_headers aligned for Cloudflare fallback", () => {
    const sections = parseNetlifyHeaders(join(ROOT, "public/_headers"));
    const global = sections.get("/*");
    expect(global).toBeTruthy();
    for (const [key, value] of Object.entries(HTML_SECURITY_HEADERS)) {
      expect(global?.[key]).toBe(value);
    }
  });
});
