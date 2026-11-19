#!/usr/bin/env node
import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const PORT = 4321;
const BASE = `http://127.0.0.1:${PORT}`;
const ROUTES = [
  "/",
  "/pricing",
  "/solutions/work-order-software",
  "/solutions/preventive-maintenance-software",
  "/compare/maintenease-vs-maintainx",
  "/compare/maintenease-vs-fiix",
  "/learn/cmms",
];
const RUNS = 7;

const serve = spawn("npx", ["serve", "-s", "dist", "-l", String(PORT)], {
  stdio: "ignore",
  cwd: resolve("."),
});

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForServer() {
  for (let i = 0; i < 60; i++) {
    try {
      const res = await fetch(BASE, { signal: AbortSignal.timeout(1_500) });
      if (res.ok) return;
    } catch {
      await sleep(250);
    }
  }
  throw new Error("serve did not start");
}

function lcpElementFromReport(json) {
  const elAudit = json.audits["largest-contentful-paint-element"];
  const item = elAudit?.details?.items?.[0];
  if (item?.node?.snippet) {
    return item.node.snippet.replace(/\s+/g, " ").slice(0, 120);
  }
  const insight = json.audits["lcp-breakdown-insight"]?.details?.items?.[0];
  if (insight?.node?.snippet) {
    return insight.node.snippet.replace(/\s+/g, " ").slice(0, 120);
  }
  return "n/a";
}

function runLighthouse(url) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      "npx",
      [
        "lighthouse",
        url,
        "--preset=perf",
        "--form-factor=mobile",
        "--screenEmulation.mobile",
        "--only-categories=performance",
        "--output=json",
        "--quiet",
        "--chrome-flags=--headless --no-sandbox",
      ],
      { stdio: ["ignore", "pipe", "pipe"] },
    );
    let out = "";
    child.stdout.on("data", (d) => {
      out += d;
    });
    child.on("close", (code) => {
      if (code !== 0) return reject(new Error(`lighthouse exit ${code}`));
      try {
        const json = JSON.parse(out);
        const lcpMs = json.audits["largest-contentful-paint"]?.numericValue;
        const fcpMs = json.audits["first-contentful-paint"]?.numericValue;
        resolvePromise({
          lcpSec: lcpMs != null ? lcpMs / 1000 : null,
          fcpSec: fcpMs != null ? fcpMs / 1000 : null,
          lcpElement: lcpElementFromReport(json),
        });
      } catch (e) {
        reject(e);
      }
    });
  });
}

async function main() {
  await waitForServer();
  for (const route of ROUTES) {
    await fetch(`${BASE}${route}`);
  }

  const rows = [];
  for (const route of ROUTES) {
    const url = `${BASE}${route}`;
    for (let run = 1; run <= RUNS; run++) {
      const { lcpSec, fcpSec, lcpElement } = await runLighthouse(url);
      rows.push({
        route,
        run,
        fcpSec: fcpSec?.toFixed(3) ?? "n/a",
        lcpSec: lcpSec?.toFixed(3) ?? "n/a",
        lcpElement,
      });
      process.stderr.write(
        `${route} run ${run}/${RUNS} FCP=${fcpSec?.toFixed(3)}s LCP=${lcpSec?.toFixed(3)}s\n`,
      );
    }
  }

  serve.kill("SIGTERM");
  const outPath = resolve("dist/lighthouse-mobile-marketing.json");
  writeFileSync(outPath, JSON.stringify(rows, null, 2));
  console.log(JSON.stringify(rows));
}

main().catch((err) => {
  serve.kill("SIGTERM");
  console.error(err);
  process.exit(1);
});