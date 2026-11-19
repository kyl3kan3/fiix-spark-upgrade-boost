/**
 * Count unique internal path hrefs on homepage (SSR HTML vs hydrated DOM).
 * Usage: node scripts/count-homepage-internal-links.mjs <distDir> [port]
 */
import { readFileSync } from "node:fs";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright";
import { spawn } from "node:child_process";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const distDir = resolve(process.argv[2] || resolve(repoRoot, "dist"));
const port = Number(process.argv[3] || 4188);

function uniqueInternalHrefsFromHtml(html) {
  const hrefs = new Set();
  for (const m of html.matchAll(/\shref="(\/[^"#?][^"]*)"/g)) {
    hrefs.add(m[1].replace(/\/+$/, "") || "/");
  }
  return hrefs.size;
}

const html = readFileSync(resolve(distDir, "index.html"), "utf8");
const rawCount = uniqueInternalHrefsFromHtml(html);

const serverPath = resolve(repoRoot, "scripts/lab-static-server.mjs");
const server = spawn(process.execPath, [serverPath, distDir, String(port)], { stdio: "ignore" });

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`);
      if (res.ok) return;
    } catch {
      await new Promise((r) => setTimeout(r, 200));
    }
  }
  throw new Error("server did not start");
}

try {
  await waitForServer();
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: "networkidle" });
  const renderedCount = await page.evaluate(() => {
    const hrefs = new Set();
    document.querySelectorAll('a[href^="/"]').forEach((a) => {
      const path = a.getAttribute("href")?.split(/[?#]/)[0] ?? "";
      if (path) hrefs.add(path.replace(/\/+$/, "") || "/");
    });
    return hrefs.size;
  });
  await browser.close();
  console.log(JSON.stringify({ distDir, rawHtmlUniqueInternalHrefs: rawCount, renderedDomUniqueInternalHrefs: renderedCount }, null, 2));
} finally {
  server.kill("SIGTERM");
}