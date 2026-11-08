import { describe, expect, it } from "vitest";
import { getMaintenanceTemplate } from "@/data/maintenanceTemplates";
import { buildExpandedTemplateStaticBody } from "@/lib/templateExpandedStaticBody";

const esc = (value: string) =>
  value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

describe("expanded maintenance log static body", () => {
  const template = getMaintenanceTemplate("maintenance-log-template");
  if (!template) throw new Error("template missing");

  const html = buildExpandedTemplateStaticBody(template, esc).join("\n");

  it("includes all 13 field labels, example disclaimer, and three data rows", () => {
    expect(html).toContain("What's in the template");
    expect(html).toContain("Example only — fictional entries for illustration.");
    expect(html).toContain("These fictional rows show how each column looks with real maintenance data.");
    for (const header of template.previewHeaders) {
      expect(html).toContain(`<th scope="col">${header}</th>`);
    }
    expect(template.previewHeaders).toHaveLength(13);
    expect(html).toContain("Open");
    expect(html).toContain("Awaiting spring delivery");
    expect(html).toContain('overflow-x:auto');
  });

  it("matches FAQ copy used in JSON-LD", () => {
    expect(html).toContain("Frequently asked questions");
    for (const faq of template.faqs) {
      expect(html).toContain(`<h3>${esc(faq.q)}</h3>`);
      expect(html).toContain(`<p>${esc(faq.a)}</p>`);
    }
  });
});
