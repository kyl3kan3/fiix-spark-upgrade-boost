import { describe, expect, it } from "vitest";
import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { getMaintenanceTemplate, maintenanceTemplates } from "@/data/maintenanceTemplates";

describe("maintenance templates", () => {
  it("publishes the four keyword-plan templates with unique slugs", () => {
    expect(maintenanceTemplates.map((template) => template.slug)).toEqual([
      "maintenance-log-template",
      "preventive-maintenance-checklist",
      "work-order-template",
      "preliminary-hazard-analysis-template",
    ]);
    expect(new Set(maintenanceTemplates.map((template) => template.slug)).size).toBe(4);
  });

  it("backs every landing page with non-empty downloadable files", () => {
    for (const template of maintenanceTemplates) {
      const downloads = template.downloads ?? [{ path: template.downloadPath, format: "CSV" }];
      for (const download of downloads) {
        const filePath = resolve(process.cwd(), "public", download.path.replace(/^\//, ""));
        expect(existsSync(filePath), `${template.slug} ${download.format} download is missing`).toBe(true);
        expect(readFileSync(filePath).byteLength).toBeGreaterThan(100);
      }
    }
  });

  it("carries complete SEO, instructions, FAQs, and internal links", () => {
    for (const template of maintenanceTemplates) {
      expect(template.metaTitle.length).toBeGreaterThan(20);
      expect(template.metaDescription.length).toBeGreaterThan(100);
      expect(template.columns.length).toBeGreaterThanOrEqual(6);
      expect(template.steps.length).toBeGreaterThanOrEqual(3);
      expect(template.faqs.length).toBeGreaterThanOrEqual(3);
      expect(template.relatedLearn.href).toMatch(/^\/(learn|tools)\//);
      expect(template.relatedSolution.href).toMatch(/^\/solutions\//);
      expect(getMaintenanceTemplate(template.slug)).toBe(template);
    }
  });
});
