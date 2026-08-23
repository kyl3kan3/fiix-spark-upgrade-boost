import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";

const read = (path: string) => readFileSync(resolve(path), "utf8");

const collectTsxFiles = (directory: string): string[] => readdirSync(directory, { withFileTypes: true })
  .flatMap((entry) => {
    const path = join(directory, entry.name);
    if (entry.isDirectory()) return collectTsxFiles(path);
    return entry.isFile() && path.endsWith(".tsx") ? [path] : [];
  });

describe("page semantics", () => {
  it("leaves the marketing layout as the only main landmark", () => {
    expect(read("src/components/marketing/MarketingLayout.tsx").match(/<main\b/g)).toHaveLength(1);

    for (const page of [
      "src/pages/AboutPage.tsx",
      "src/pages/EditorialPolicyPage.tsx",
      "src/pages/FacilityManagementPage.tsx",
    ]) {
      expect(read(page), page).not.toMatch(/<main\b/);
    }
  });

  it("does not put a button inside a link", () => {
    const nestedInteractive = /<(?:Link|a)\b[^>]*>\s*<Button\b/s;
    const offenders = collectTsxFiles(resolve("src"))
      .filter((path) => nestedInteractive.test(readFileSync(path, "utf8")));

    expect(offenders).toEqual([]);
  });
});
