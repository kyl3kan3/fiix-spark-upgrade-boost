import { spawn, type ChildProcess } from "node:child_process";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const SERVE_PORT = 4317;
const BASE = `http://127.0.0.1:${SERVE_PORT}`;
const VIEWPORT = { width: 412, height: 823 };

const ROUTES = [
  "/",
  "/solutions/work-order-software",
  "/compare/maintenease-vs-maintainx",
  "/learn/cmms",
] as const;

let serve: ChildProcess;

type TextBox = { text: string; width: number; height: number; area: number };

async function collectAboveFoldTextBoxes(page: import("playwright").Page): Promise<TextBox[]> {
  return page.evaluate((foldHeight) => {
    const blocks: TextBox[] = [];
    const selectors = "h1, h2, h3, p";
    for (const el of document.querySelectorAll<HTMLElement>(selectors)) {
      if (el.closest('[aria-hidden="true"]')) continue;
      const rect = el.getBoundingClientRect();
      if (rect.bottom <= 0 || rect.top >= foldHeight) continue;
      if (rect.width <= 0 || rect.height <= 0) continue;
      const text = (el.textContent ?? "").replace(/\s+/g, " ").trim();
      if (text.length < 12) continue;
      blocks.push({
        text,
        width: Math.round(rect.width * 100) / 100,
        height: Math.round(rect.height * 100) / 100,
        area: Math.round(rect.width * rect.height * 100) / 100,
      });
    }
    blocks.sort((a, b) => a.text.localeCompare(b.text));
    return blocks;
  }, VIEWPORT.height);
}

function matchBlocks(before: TextBox[], after: TextBox[]): void {
  const afterByText = new Map(after.map((b) => [b.text, b]));
  const failures: string[] = [];

  for (const pre of before) {
    const post = afterByText.get(pre.text);
    if (!post) continue;
    if (post.width > pre.width + 0.5 || post.height > pre.height + 0.5) {
      failures.push(
        `"${pre.text.slice(0, 48)}…" grew ${pre.width}x${pre.height} → ${post.width}x${post.height}`,
      );
    }
  }

  expect(failures, failures.join("\n")).toEqual([]);
}

beforeAll(async () => {
  serve = spawn("npx", ["serve", "-s", "dist", "-l", String(SERVE_PORT)], {
    cwd: repoRoot,
    stdio: "ignore",
  });
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (let i = 0; i < 50; i++) {
    try {
      await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 2_000 });
      break;
    } catch {
      await page.waitForTimeout(200);
    }
  }
  await browser.close();
}, 90_000);

afterAll(() => {
  serve?.kill("SIGTERM");
});

describe("marketing text geometry (mobile)", () => {
  for (const route of ROUTES) {
    it(`${route} hydrated text blocks are not larger than prerender`, async () => {
      const { chromium } = await import("playwright");
      const browser = await chromium.launch();
      const context = await browser.newContext({
        viewport: VIEWPORT,
        userAgent:
          "Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36",
      });

      const noJs = await context.newPage();
      await noJs.route("**/*", (routeRequest) => {
        if (routeRequest.request().resourceType() === "script") return routeRequest.abort();
        return routeRequest.continue();
      });

      await noJs.goto(`${BASE}${route}`, { waitUntil: "domcontentloaded" });
      const before = await collectAboveFoldTextBoxes(noJs);

      const hydrated = await context.newPage();
      await hydrated.goto(`${BASE}${route}`, { waitUntil: "networkidle" });
      await hydrated.waitForFunction(
        () => !document.querySelector('#root [data-prerender="static"]'),
        undefined,
        { timeout: 30_000 },
      );
      await hydrated.waitForTimeout(500);
      const after = await collectAboveFoldTextBoxes(hydrated);

      matchBlocks(before, after);

      await browser.close();
    }, 120_000);
  }
});