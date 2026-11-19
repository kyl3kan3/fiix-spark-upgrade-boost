import http from "node:http";
import { spawn } from "node:child_process";
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(__dirname, "..");
const mainDist = resolve(process.argv[2] || "/tmp/fiix-main-build/dist");
const prDist = resolve(process.argv[3] || resolve(repoRoot, "dist"));
const mainPort = Number(process.argv[4] || 4190);
const prPort = Number(process.argv[5] || 4191);
const runs = Number(process.argv[6] || 7);

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
const lighthouseBin = process.env.LIGHTHOUSE_BIN || "npx";
const lighthouseArgsPrefix = process.env.LIGHTHOUSE_BIN ? [] : ["lighthouse"];
const outDir = resolve(repoRoot, "artifacts/lighthouse-interleaved");
mkdirSync(outDir, { recursive: true });

function median(nums) {
  const sorted = [...nums].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2;
}

function waitForServer(port) {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const attempt = () => {
      const req = http.get(`http://127.0.0.1:${port}/`, (res) => {
        res.resume();
        if (res.statusCode === 200) resolve();
        else if (++tries < 120) setTimeout(attempt, 250);
        else reject(new Error(`server on ${port} returned ${res.statusCode}`));
      });
      req.on("error", () => {
        if (++tries < 120) setTimeout(attempt, 250);
        else reject(new Error(`server on ${port} did not start`));
      });
    };
    attempt();
  });
}

function runLighthouse(url, outFile) {
  return new Promise((resolvePromise, reject) => {
    const child = spawn(
      lighthouseBin,
      [
        ...lighthouseArgsPrefix,
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

function summarizeRows(rows) {
  const lcps = rows.map((r) => r.lcp).filter((v) => v != null);
  return {
    fcp: { median: median(rows.map((r) => r.fcp).filter(Boolean)), worst: Math.max(...rows.map((r) => r.fcp).filter(Boolean)) },
    lcp: { median: median(lcps), worst: Math.max(...lcps), over25s: lcps.filter((v) => v > 2500).length },
    tbt: { median: median(rows.map((r) => r.tbt).filter(Boolean)), worst: Math.max(...rows.map((r) => r.tbt).filter(Boolean)) },
  };
}

const mainServer = spawn(process.execPath, [serverPath, mainDist, String(mainPort)], { stdio: "inherit" });
const prServer = spawn(process.execPath, [serverPath, prDist, String(prPort)], { stdio: "inherit" });

try {
  await waitForServer(mainPort);
  await waitForServer(prPort);
  const summary = { main: {}, pr: {} };
  for (const route of ROUTES) {
    const mainRows = [];
    const prRows = [];
    for (let i = 0; i < runs; i++) {
      const slug = route.replace(/\//g, "_") || "home";
      const mainFile = resolve(outDir, `main_${slug}_${i}.json`);
      const prFile = resolve(outDir, `pr_${slug}_${i}.json`);
      await runLighthouse(`http://127.0.0.1:${mainPort}${route}`, mainFile);
      await runLighthouse(`http://127.0.0.1:${prPort}${route}`, prFile);
      const pick = (file) => {
        const audits = JSON.parse(readFileSync(file, "utf8")).audits ?? {};
        return {
          fcp: audits["first-contentful-paint"]?.numericValue ?? null,
          lcp: audits["largest-contentful-paint"]?.numericValue ?? null,
          tbt: audits["total-blocking-time"]?.numericValue ?? null,
        };
      };
      mainRows.push(pick(mainFile));
      prRows.push(pick(prFile));
    }
    summary.main[route] = summarizeRows(mainRows);
    summary.pr[route] = summarizeRows(prRows);
  }

  const md = ["| Route | Main LCP med | PR LCP med | Main TBT med | PR TBT med | Main >2.5s | PR >2.5s |",
    "| --- | ---: | ---: | ---: | ---: | ---: | ---: |"];
  let mainLate = 0;
  let prLate = 0;
  for (const route of ROUTES) {
    const m = summary.main[route];
    const p = summary.pr[route];
    mainLate += m.lcp.over25s;
    prLate += p.lcp.over25s;
    md.push(
      `| ${route} | ${(m.lcp.median / 1000).toFixed(2)}s | ${(p.lcp.median / 1000).toFixed(2)}s | ${Math.round(m.tbt.median)}ms | ${Math.round(p.tbt.median)}ms | ${m.lcp.over25s}/${runs} | ${p.lcp.over25s}/${runs} |`,
    );
  }
  md.push("", `**Late LCP totals:** main ${mainLate}/${ROUTES.length * runs}, PR ${prLate}/${ROUTES.length * runs}`);
  writeFileSync(resolve(outDir, "summary.json"), JSON.stringify(summary, null, 2));
  writeFileSync(resolve(outDir, "summary.md"), md.join("\n"));
  console.log(md.join("\n"));
} finally {
  mainServer.kill("SIGTERM");
  prServer.kill("SIGTERM");
}