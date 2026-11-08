import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getMaintenanceTemplate } from "@/data/maintenanceTemplates";

/**
 * Runs after `npm run build` (CI post-build step). Excluded from the default `vitest run` suite via vitest.config.
 */
describe("expanded maintenance log built prerender HTML", () => {
  const template = getMaintenanceTemplate("maintenance-log-template");
  if (!template) throw new Error("template missing");

  const distPath = resolve(process.cwd(), "dist/templates/maintenance-log-template/index.html");

  it("matches expanded static body in dist/templates/maintenance-log-template/index.html", () => {
    expect(existsSync(distPath), "dist missing — run npm run build before this test").toBe(true);
    const built = readFileSync(distPath, "utf8");
    expect(built).toContain("Example only — fictional entries for illustration.");
    expect(built).toContain("<th scope=\"col\">Next Service Due</th>");
    expect(built).toContain('overflow-x:auto;max-width:100%');
    expect((built.match(/<th scope="col">/g) ?? []).length).toBeGreaterThanOrEqual(13);
    expect(built).toContain('"@type":"FAQPage"');
    for (const faq of template.faqs) {
      expect(built).toContain(faq.q);
      expect(built).toContain(faq.a);
    }
  });
});
