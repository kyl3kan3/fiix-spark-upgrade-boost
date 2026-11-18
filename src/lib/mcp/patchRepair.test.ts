import { expect, it, describe } from "vitest";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";

const bunPath = spawnSync("which", ["bun"], { encoding: "utf8" }).stdout.trim();

describe.skipIf(!bunPath)("MCP patch repair with Bun", () => {
it("repairs an unpatched SDK when npm_execpath is the native Bun binary", () => {
  const root = mkdtempSync(path.join(tmpdir(), "mcp-patch-repair-"));
  try {
    const sdkDir = path.join(root, "node_modules/@lovable.dev/mcp-js/dist/stacks/supabase");
    const patchDir = path.join(root, "node_modules/patch-package");
    mkdirSync(sdkDir, { recursive: true });
    mkdirSync(patchDir, { recursive: true });
    for (const extension of ["js", "cjs"]) {
      writeFileSync(path.join(sdkDir, `vite.${extension}`), "unpatched");
    }
    writeFileSync(path.join(patchDir, "index.js"), `
      const fs = require('node:fs');
      for (const extension of ['js', 'cjs']) {
        fs.writeFileSync('node_modules/@lovable.dev/mcp-js/dist/stacks/supabase/vite.' + extension, 'wrapMcpHandler');
      }
      console.log('local patch tool executed');
    `);
    const result = spawnSync(process.execPath, [path.resolve("scripts/ensure-mcp-js-patch.mjs")], {
      cwd: root,
      env: { ...process.env, npm_execpath: bunPath },
      encoding: "utf8",
    });
    expect(result.status, result.stderr).toBe(0);
    expect(result.stdout).toContain("local patch tool executed");
    expect(result.stdout).toContain("CORS wrapper patch applied");
    expect(result.stdout).not.toContain("reinstalling");
  } finally {
    rmSync(root, { recursive: true, force: true });
  }
});
});