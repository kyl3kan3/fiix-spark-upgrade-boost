import { spawn, type ChildProcess } from "node:child_process";
import { existsSync, readdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const LAB_PORT = 4192;
const BASE = `http://127.0.0.1:${LAB_PORT}`;
const STATIC_SERVER = resolve(repoRoot, "scripts/lab-static-server.mjs");

const MARKETING_ROUTES = [
  "/",
  "/pricing",
  "/solutions/work-order-software",
  "/solutions/preventive-maintenance-software",
  "/compare/maintenease-vs-maintainx",
  "/compare/maintenease-vs-fiix",
  "/learn/cmms",
];

function discoverBlogRoutes(): string[] {
  const blogDir = resolve(repoRoot, "dist/blog");
  const routes = ["/blog"];
  if (!existsSync(blogDir)) return routes;
  const slugDir = readdirSync(blogDir, { withFileTypes: true })
    .filter((d) => d.isDirectory())
    .map((d) => d.name)
    .find((name) => existsSync(resolve(blogDir, name, "index.html")));
  if (slugDir) routes.push(`/blog/${slugDir}`);
  return routes;
}

let server: ChildProcess;

beforeAll(async () => {
  server = spawn(process.execPath, [STATIC_SERVER, resolve(repoRoot, "dist"), String(LAB_PORT)], {
    cwd: repoRoot,
    stdio: "ignore",
  });
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (let i = 0; i < 60; i++) {
    try {
      await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 2_000 });
      break;
    } catch {
      await page.waitForTimeout(250);
    }
  }
  await browser.close();
}, 90_000);

afterAll(() => {
  server?.kill("SIGTERM");
});

const HYDRATION_ROUTES = [...MARKETING_ROUTES, ...discoverBlogRoutes()];

function isAllowedThirdPartyNoise(line: string): boolean {
  return (
    /DataFast: Tracking disabled - bot detected/i.test(line) ||
    /net::ERR_BLOCKED_BY_RESPONSE/i.test(line) ||
    /ERR_CONNECTION_CLOSED/i.test(line)
  );
}

describe("marketing pages hydrate without mismatch", () => {
  for (const route of HYDRATION_ROUTES) {
    it(`hydrates ${route} with no React hydration errors`, async () => {
      const { chromium } = await import("playwright");
      const browser = await chromium.launch();
      const page = await browser.newPage();
      const issues: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error" || msg.type() === "warning") {
          issues.push(`[console.${msg.type()}] ${msg.text()}`);
        }
      });
      page.on("pageerror", (err) => {
        issues.push(`[pageerror] ${err.message}`);
      });

      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1_500);

      const root = await page.$("#root[data-ssr='marketing']");
      expect(root, "expected hydrated marketing root").toBeTruthy();
      const reactHydration = issues.filter(
        (line) =>
          /#418|#423|hydration|did not match|Hydration failed|server HTML|Minified React error/i.test(
            line,
          ),
      );
      expect(reactHydration, issues.join("\n")).toEqual([]);
      const blocking = issues.filter((line) => !isAllowedThirdPartyNoise(line));
      expect(blocking, blocking.join("\n")).toEqual([]);

      if (route !== "/blog") {
        const jsonLdCount = await page.evaluate(() => {
          return document.querySelectorAll('script[type="application/ld+json"]').length;
        });
        expect(jsonLdCount).toBeGreaterThanOrEqual(1);
      }

      await browser.close();
    }, 90_000);
  }
});