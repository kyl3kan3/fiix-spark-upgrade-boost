import { spawn, type ChildProcess } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const LAB_PORT = 4192;
const BASE = `http://127.0.0.1:${LAB_PORT}`;
const STATIC_SERVER = resolve(repoRoot, "scripts/lab-static-server.mjs");

const ROUTES = [
  "/",
  "/pricing",
  "/solutions/work-order-software",
  "/solutions/preventive-maintenance-software",
  "/compare/maintenease-vs-maintainx",
  "/compare/maintenease-vs-fiix",
  "/learn/cmms",
];

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

describe("marketing pages hydrate without mismatch", () => {
  for (const route of ROUTES) {
    it(`hydrates ${route} with no React hydration warnings`, async () => {
      const { chromium } = await import("playwright");
      const browser = await chromium.launch();
      const page = await browser.newPage();
      const hydrationIssues: string[] = [];
      page.on("console", (msg) => {
        const text = msg.text();
        if (
          /hydration|did not match|Hydration failed|server HTML/i.test(text) ||
          (msg.type() === "error" && /react/i.test(text))
        ) {
          hydrationIssues.push(text);
        }
      });

      await page.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
      await page.waitForTimeout(1_500);

      const root = await page.$("#root[data-ssr='marketing']");
      expect(root, "expected hydrated marketing root").toBeTruthy();
      expect(hydrationIssues, hydrationIssues.join("\n")).toEqual([]);

      const jsonLdCount = await page.evaluate(() => {
        return document.querySelectorAll('script[type="application/ld+json"]').length;
      });
      expect(jsonLdCount).toBeGreaterThanOrEqual(1);

      await browser.close();
    }, 90_000);
  }
});