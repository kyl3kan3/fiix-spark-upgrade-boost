import { spawn } from "node:child_process";
import { chromium } from "playwright";

const PORT = 4193;
const server = spawn(process.execPath, ["scripts/lab-static-server.mjs", "dist", String(PORT)], {
  stdio: "ignore",
});
await new Promise((r) => setTimeout(r, 1500));

const browser = await chromium.launch();
const noJs = await browser.newPage({ javaScriptEnabled: false });
await noJs.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "domcontentloaded" });
const ssrRoot = await noJs.evaluate(() => document.getElementById("root")?.innerHTML.slice(0, 500));
console.log("SSR root prefix:", ssrRoot);
await noJs.close();

const page = await browser.newPage();
page.on("pageerror", (e) => console.log("pageerror:", e.message));
page.on("console", (m) => {
  if (m.type() === "error" || /hydration|did not match/i.test(m.text())) {
    console.log(`console.${m.type()}:`, m.text());
  }
});
let clientEarly = "";
page.on("domcontentloaded", async () => {
  clientEarly = await page.evaluate(() => document.getElementById("root")?.innerHTML.slice(0, 800));
});
await page.goto(`http://127.0.0.1:${PORT}/`, { waitUntil: "domcontentloaded" });
console.log("Client at DCL:", clientEarly.slice(0, 500));
console.log("SSR equals client at DCL:", ssrRoot.slice(0, 400) === clientEarly.slice(0, 400));
await page.waitForTimeout(2500);
const hydratedRoot = await page.evaluate(() => document.getElementById("root")?.innerHTML.slice(0, 500));
console.log("Client root prefix:", hydratedRoot);
const match = await page.evaluate(() => {
  const root = document.getElementById("root");
  return root?.getAttribute("data-hydration-mismatch");
});
console.log("data-hydration-mismatch", match);
await browser.close();
server.kill("SIGTERM");