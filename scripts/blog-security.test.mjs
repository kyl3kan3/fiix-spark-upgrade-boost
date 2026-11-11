import assert from "node:assert/strict";
import { mkdtempSync, mkdirSync, writeFileSync, readFileSync, existsSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { stripTypeScriptTypes } from "node:module";
import vm from "node:vm";
import test from "node:test";
import { isSafeBlogSlug } from "../supabase/functions/_shared/blogSlug.ts";

const root = resolve(import.meta.dirname, "..");
const unsafe = ["index", "../index", "../../escape", 'evil"><script>alert(1)</script>', "%2e%2e", "a/b",
  "a\\b", "a?b", "a#b", "a\n", "", null, {}, ["valid-slug"]];

test("article receiver rejects unsafe slugs before any privileged write", async () => {
  let handler;
  const writes = [];
  const source = readFileSync(join(root, "supabase/functions/receive-article/index.ts"), "utf8")
    .replace(/^import .*;$/gm, "");
  vm.runInNewContext(stripTypeScriptTypes(source), {
    isSafeBlogSlug, Response, createClient: () => ({ from: () => ({
      upsert: async row => { writes.push(row); return { error: null }; },
    }) }),
    Deno: { serve: fn => { handler = fn; }, env: { get: () => "test-secret" } },
  });
  for (const slug of unsafe) {
    const response = await handler(new Request("https://example.test", {
      method: "POST", headers: { authorization: "Bearer test-secret" },
      body: JSON.stringify({ id: 1, title: "Article", slug }),
    }));
    assert.equal(response.status, 400, JSON.stringify(slug));
  }
  assert.equal(writes.length, 0);
  const response = await handler(new Request("https://example.test", {
    method: "POST", headers: { authorization: "Bearer test-secret" },
    body: JSON.stringify({ id: 1, title: "Article", slug: "maintenance-101" }),
  }));
  assert.equal(response.status, 200);
  assert.equal(writes[0].slug, "maintenance-101");
});

test("real prerender and sitemap exclude malicious database rows and preserve valid output", async () => {
  const directory = mkdtempSync(join(tmpdir(), "blog-security-"));
  const cwd = process.cwd();
  const originalFetch = globalThis.fetch;
  mkdirSync(join(directory, "dist"));
  mkdirSync(join(directory, "public"));
  mkdirSync(join(directory, "src/data"), { recursive: true });
  writeFileSync(join(directory, "dist/index.html"), '<html><head></head><body><div id="root"></div></body></html>');
  globalThis.fetch = async () => Response.json([
    ...unsafe.map(slug => ({ slug, title: "ATTACK_SENTINEL", content_html: "<p>malicious row</p>" })),
    { slug: "maintenance-101", title: "Legitimate article", content_html: "<p>Useful maintenance advice</p>" },
  ]);
  try {
    process.chdir(directory);
    await import(pathToFileURL(join(root, "scripts/prerender.ts")).href);
    for (const path of ["dist/blog/maintenance-101/index.html", "dist/blog/maintenance-101.html",
      "dist/blog/maintenance-101.md"]) assert.ok(existsSync(path), path);
    assert.match(readFileSync("dist/blog/maintenance-101.html", "utf8"), /Legitimate article/);
    assert.doesNotMatch(readFileSync("dist/index.html", "utf8"), /ATTACK_SENTINEL/);
    assert.doesNotMatch(readFileSync("dist/blog/index.html", "utf8"), /ATTACK_SENTINEL/);
    assert.equal(existsSync("escape.html"), false);
    await import(pathToFileURL(join(root, "scripts/generate-sitemap.ts")).href);
    const sitemap = readFileSync("public/sitemap.xml", "utf8");
    assert.match(sitemap, /\/blog\/maintenance-101/);
    assert.doesNotMatch(sitemap, /ATTACK_SENTINEL|\.\.\/|%2e|<script>|\/blog\/null|\/blog\/valid-slug/);
  } finally {
    process.chdir(cwd);
    globalThis.fetch = originalFetch;
    rmSync(directory, { recursive: true, force: true });
  }
});
