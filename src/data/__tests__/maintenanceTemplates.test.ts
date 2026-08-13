import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getMaintenanceTemplate, maintenanceTemplates } from "@/data/maintenanceTemplates";

describe("maintenance templates", () => {
  it("publishes the three keyword-plan templates with unique slugs", () => {
    expect(maintenanceTemplates.map((template) => template.slug)).toEqual([
      "maintenance-log-template",
      "preventive-maintenance-checklist",
      "work-order-template",
    ]);
    expect(new Set(maintenanceTemplates.map((template) => template.slug)).size).toBe(3);
  });

  it("backs every landing page with a non-empty CSV download", () => {
    for (const template of maintenanceTemplates) {
      const filePath = resolve(process.cwd(), "public", template.downloadPath.replace(/^\//, ""));
      expect(existsSync(filePath), `${template.slug} download is missing`).toBe(true);
      const csv = readFileSync(filePath, "utf8");
      expect(csv.split("\n")[0].split(",").length).toBeGreaterThanOrEqual(6);
      expect(csv.trim().split("\n").length).toBeGreaterThanOrEqual(3);
    }
  });

  it("carries complete SEO, instructions, FAQs, and internal links", () => {
    for (const template of maintenanceTemplates) {
      expect(template.metaTitle.length).toBeGreaterThan(20);
      expect(template.metaDescription.length).toBeGreaterThan(100);
      expect(template.columns.length).toBeGreaterThanOrEqual(6);
      expect(template.steps.length).toBeGreaterThanOrEqual(3);
      expect(template.faqs.length).toBeGreaterThanOrEqual(3);
      expect(template.relatedLearn.href).toMatch(/^\/learn\//);
      expect(template.relatedSolution.href).toMatch(/^\/solutions\//);
      expect(getMaintenanceTemplate(template.slug)).toBe(template);
    }
  });
});
