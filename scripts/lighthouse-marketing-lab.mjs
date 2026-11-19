import { spawn } from "node:child_process";
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const distArg = process.argv[2] || resolve(repoRoot, "dist");
const label = process.argv[3] || "pr";
const port = Number(process.argv[4] || 4191);
const runs = Number(process.argv[5] || 7);

const ROUTES = [
  "/",
  "/pricing",
  "/solutions/work-order-software",
  "/solutions/preventive-maintenance-software",
  "/compare/maintenease-vs-maintainx",
  "/compare/maintenease-vs-fiix",
  "/learn/cmms",
];

const serverPath = resolve(repoRoot, "scripts/lab-static-server.mjs");
const lighthouseBin = resolve(repoRoot, "node_modules/.bin/lighthouse");
const outDir = resolve(repoRoot, `artifacts/lighthouse-${label}`);
mkdirSync(outDir, { recursive: true });

function median(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

async function waitForServer() {
  for (let i = 0; i < 40; i++) {
    try {
      const res = await fetch(`http://127.0.0.1:${port}/`);
      if (res.ok) return;
    } catch {
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  throw new Error("static server did not start");
}

function runLighthouse(url, outFile) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      lighthouseBin,
      [
        url,
        "--quiet",
        "--chrome-flags=--headless --no-sandbox --disable-gpu",
        "--only-categories=performance",
        "--form-factor=mobile",
        "--screenEmulation.mobile",
        "--output=json",
        `--output-path=${outFile}`,
      ],
      { stdio: "inherit", cwd: repoRoot },
    );
    child.on("exit", (code) => {
      if (code === 0) resolvePromise();
      else reject(new Error(`lighthouse failed for ${url} (${code})`));
    });
  });
}

const server = spawn(process.execPath, [serverPath, distArg, String(port)], {
  cwd: repoRoot,
  stdio: "inherit",
});

try {
  await waitForServer();
  const summary = {};
  for (const route of ROUTES) {
    const rows = [];
    for (let i = 0; i < runs; i++) {
      const outFile = resolve(outDir, `${route.replace(/\//g, "_") || "home"}-${i}.json`);
      const url = `http://127.0.0.1:${port}${route}`;
      await runLighthouse(url, outFile);
      const report = JSON.parse(
        (await import("node:fs")).readFileSync(outFile, "utf8"),
      );
      const audits = report.audits ?? {};
      rows.push({
        fcp: audits["first-contentful-paint"]?.numericValue ?? null,
        lcp: audits["largest-contentful-paint"]?.numericValue ?? null,
        cls: audits["cumulative-layout-shift"]?.numericValue ?? null,
        tbt: audits["total-blocking-time"]?.numericValue ?? null,
      });
    }
    const lcps = rows.map((r) => r.lcp).filter((v) => v != null);
    summary[route] = {
      fcp: {
        median: median(rows.map((r) => r.fcp).filter(Boolean)),
        worst: Math.max(...rows.map((r) => r.fcp).filter(Boolean)),
      },
      lcp: {
        median: median(lcps),
        worst: Math.max(...lcps),
        over25s: lcps.filter((v) => v > 2500).length,
      },
      cls: {
        median: median(rows.map((r) => r.cls).filter((v) => v != null)),
        worst: Math.max(...rows.map((r) => r.cls).filter((v) => v != null)),
      },
      tbt: {
        median: median(rows.map((r) => r.tbt).filter(Boolean)),
        worst: Math.max(...rows.map((r) => r.tbt).filter(Boolean)),
      },
    };
  }
  const mdLines = [
    `| Route | LCP med | LCP worst | >2.5s | FCP med | CLS med | TBT med |`,
    `| --- | ---: | ---: | ---: | ---: | ---: | ---: |`,
  ];
  for (const route of ROUTES) {
    const s = summary[route];
    mdLines.push(
      `| ${route} | ${(s.lcp.median / 1000).toFixed(2)}s | ${(s.lcp.worst / 1000).toFixed(2)}s | ${s.lcp.over25s}/${runs} | ${(s.fcp.median / 1000).toFixed(2)}s | ${s.cls.median.toFixed(3)} | ${Math.round(s.tbt.median)}ms |`,
    );
  }
  writeFileSync(resolve(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  writeFileSync(resolve(outDir, "summary.md"), mdLines.join("\n"));
  console.log(mdLines.join("\n"));
} finally {
  server.kill("SIGTERM");
}