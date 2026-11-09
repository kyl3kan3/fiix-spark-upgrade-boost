import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

function hasNestedAnchorElements(html: string): boolean {
  const doc = new DOMParser().parseFromString(html, "text/html");
  for (const anchor of doc.querySelectorAll("a")) {
    if (anchor.querySelector("a")) return true;
  }
  return false;
}

describe("maintenance-simplified prerender HTML", () => {
  const distPath = resolve(process.cwd(), "dist/maintenance-simplified/index.html");

  it("has no nested anchor elements in the static shell", () => {
    expect(existsSync(distPath), "dist missing — run npm run build before this test").toBe(true);
    const built = readFileSync(distPath, "utf8");
    expect(hasNestedAnchorElements(built)).toBe(false);
  });
});
