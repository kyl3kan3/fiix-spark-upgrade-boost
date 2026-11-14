import { spawn, type ChildProcess } from "node:child_process";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { afterAll, beforeAll, describe, expect, it } from "vitest";

const repoRoot = resolve(dirname(fileURLToPath(import.meta.url)), "../../..");
const PREVIEW_PORT = 4174;
const BASE = `http://127.0.0.1:${PREVIEW_PORT}`;

let preview: ChildProcess;

beforeAll(async () => {
  preview = spawn("npx", ["vite", "preview", "--port", String(PREVIEW_PORT), "--host", "127.0.0.1"], {
    cwd: repoRoot,
    stdio: "ignore",
  });
  const { chromium } = await import("playwright");
  const browser = await chromium.launch();
  const page = await browser.newPage();
  for (let i = 0; i < 40; i++) {
    try {
      await page.goto(BASE, { waitUntil: "domcontentloaded", timeout: 2_000 });
      break;
    } catch {
      await page.waitForTimeout(250);
    }
  }
  await browser.close();
}, 60_000);

afterAll(() => {
  preview?.kill("SIGTERM");
});

describe("homepage DOM after hydration", () => {
  it("exposes exactly one H1 and no duplicated Stop downtime hero phrase", async () => {
    const { chromium } = await import("playwright");
    const browser = await chromium.launch();
    const page = await browser.newPage();
    await page.goto(`${BASE}/`, { waitUntil: "networkidle" });
    await page.waitForTimeout(1_500);

    const snapshot = await page.evaluate(() => {
      const h1s = [...document.querySelectorAll("h1")].map((el) => ({
        text: el.textContent?.replace(/\s+/g, " ").trim() ?? "",
        ariaHidden: el.closest('[aria-hidden="true"]') !== null,
      }));
      const accessibleH1s = h1s.filter((h) => !h.ariaHidden);
      const bodyText = document.body.innerText.replace(/\s+/g, " ").trim();
      const downtimeHits = bodyText.match(/Stop downtime before it starts\.?/gi) ?? [];
      const cmmsHits = bodyText.match(/CMMS Software for Facility & Maintenance Teams/gi) ?? [];
      return { accessibleH1s, downtimeHits: downtimeHits.length, cmmsHits: cmmsHits.length };
    });

    expect(snapshot.accessibleH1s).toHaveLength(1);
    expect(snapshot.accessibleH1s[0]?.text).toBe("CMMS Software for Facility & Maintenance Teams");
    expect(snapshot.downtimeHits).toBe(0);
    expect(snapshot.cmmsHits).toBe(1);

    await browser.close();
  }, 60_000);
});