#!/usr/bin/env node
/**
 * Idempotent @lovable.dev/mcp-js patch application for CI, Vercel, and Lovable.
 *
 * Cached node_modules (e.g. Vercel build cache) may contain a prior patch revision.
 * patch-package then fails when applying the current patch file. When the emit
 * already includes wrapMcpHandler, we skip re-patching. Otherwise we try
 * patch-package; on failure we reinstall the locked package version and patch again.
 * check:edge still verifies the wrapper is present after install.
 */
import { spawnSync } from "node:child_process";
import { existsSync, readFileSync, rmSync } from "node:fs";
import path from "node:path";
import process from "node:process";

const root = process.cwd();
const packageName = "@lovable.dev/mcp-js";
const mcpRoot = path.join(root, "node_modules", "@lovable.dev", "mcp-js");
const viteJs = path.join(mcpRoot, "dist", "stacks", "supabase", "vite.js");
const viteCjs = path.join(mcpRoot, "dist", "stacks", "supabase", "vite.cjs");
const PATCH_MARKER = "wrapMcpHandler";

function readUtf8(filePath) {
  try {
    return readFileSync(filePath, "utf8");
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "ENOENT") {
      return null;
    }
    throw error;
  }
}

function isFullyPatched() {
  const js = readUtf8(viteJs);
  const cjs = readUtf8(viteCjs);
  return Boolean(js?.includes(PATCH_MARKER) && cjs?.includes(PATCH_MARKER));
}

function lockedMcpVersion() {
  const pkg = JSON.parse(readFileSync(path.join(root, "package.json"), "utf8"));
  const version =
    pkg.dependencies?.[packageName] ?? pkg.devDependencies?.[packageName];
  if (!version) {
    throw new Error(`No locked version for ${packageName} in package.json`);
  }
  return version;
}

function runPatchPackage() {
  const npmExec = process.env.npm_execpath;
  const result = npmExec
    ? spawnSync(process.execPath, [npmExec, "exec", "--", "patch-package", "--error-on-fail"], {
        cwd: root,
        stdio: "inherit",
      })
    : spawnSync("npx", ["patch-package", "--error-on-fail"], {
        cwd: root,
        stdio: "inherit",
      });
  if (result.error) throw result.error;
  return result.status ?? 1;
}

function reinstallMcpJs() {
  const version = lockedMcpVersion();
  if (existsSync(mcpRoot)) {
    rmSync(mcpRoot, { recursive: true, force: true });
  }

  const npmExec = process.env.npm_execpath;
  const spec = `${packageName}@${version}`;
  const installArgs = ["install", spec, "--no-save", "--ignore-scripts"];

  const result = npmExec
    ? spawnSync(process.execPath, [npmExec, ...installArgs], {
        cwd: root,
        stdio: "inherit",
      })
    : spawnSync("npm", installArgs, { cwd: root, stdio: "inherit" });

  if (result.error) throw result.error;
  if ((result.status ?? 1) !== 0) {
    throw new Error(`Failed to reinstall ${spec}`);
  }
}

function failInstall(message) {
  console.error(message);
  console.error(
    "MCP CORS wrapper patch is required. Run npm run check:edge after fixing install.",
  );
  process.exit(1);
}

if (isFullyPatched()) {
  console.log(`${packageName}: patch markers present — skipping patch-package`);
  process.exit(0);
}

let status = runPatchPackage();
if (status !== 0 || !isFullyPatched()) {
  console.log(
    `${packageName}: patch-package did not produce wrapMcpHandler — reinstalling and retrying`,
  );
  reinstallMcpJs();
  status = runPatchPackage();
}

if (status !== 0) {
  failInstall(
    `${packageName}: patch-package failed after reinstall (exit ${status}).`,
  );
}

if (!isFullyPatched()) {
  failInstall(
    `${packageName}: patches/@lovable.dev+mcp-js+0.20.1.patch did not apply ` +
      `(wrapMcpHandler missing from vite emit). Package may have been upgraded without refreshing the patch.`,
  );
}

console.log(`${packageName}: CORS wrapper patch applied`);