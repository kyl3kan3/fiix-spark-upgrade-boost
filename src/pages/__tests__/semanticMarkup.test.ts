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

  it("keeps the templates card title link separate from inline template links", () => {
    const page = read("src/pages/MaintenanceSimplifiedPage.tsx");
    const card = page.match(
      /<article className="rounded-xl border border-border bg-card p-5 hover:border-primary\/30 transition-ui">[\s\S]*?Free maintenance templates[\s\S]*?<\/article>/,
    )?.[0];
    expect(card).toBeTruthy();
    const titleLink = card!.match(/<Link to="\/templates"[^>]*>[\s\S]*?<\/Link>/)?.[0];
    expect(titleLink).toBeTruthy();
    expect(titleLink).not.toContain("renderInlineMarkdownLinks");
    expect((card!.match(/<Link\b/g) ?? []).length).toBe(1);
  });
});
