import type { MaintenanceTemplate } from "@/data/maintenanceTemplates";
import { inlineMarkdownLinksToHtml } from "@/lib/inlineMarkdownLinks";

export function buildExpandedTemplateStaticBody(
  template: MaintenanceTemplate,
  esc: (value: string) => string,
): string[] {
  const parts: string[] = [];
  const fieldsHeading = template.fieldsSectionTitle ?? "Fields included";
  parts.push(`<h2>${esc(fieldsHeading)}</h2>`);
  parts.push(
    "<ol>"
      + template.columns
        .map((column) => `<li><strong>${esc(column.name)}</strong>: ${esc(column.purpose)}</li>`)
        .join("")
      + "</ol>",
  );
  if (template.fieldsSectionFooter) {
    parts.push(`<p>${esc(template.fieldsSectionFooter)}</p>`);
  }

  const previewTitle = template.previewSectionTitle ?? "Example entries";
  parts.push(`<h2>${esc(previewTitle)}</h2>`);
  if (template.previewDisclaimer) {
    parts.push(`<p>${esc(template.previewDisclaimer)}</p>`);
  }
  if (template.previewSectionLead) {
    parts.push(`<p>${esc(template.previewSectionLead)}</p>`);
  }
  parts.push(
    '<div style="overflow-x:auto;max-width:100%">'
      + "<table>"
      + `<caption>${esc(template.previewDisclaimer ?? previewTitle)}</caption>`
      + "<thead><tr>"
      + template.previewHeaders.map((header) => `<th scope="col">${esc(header)}</th>`).join("")
      + "</tr></thead><tbody>"
      + template.previewRows
        .map((row) => `<tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join("")}</tr>`)
        .join("")
      + "</tbody></table></div>",
  );

  if (template.comparisonSection) {
    parts.push(`<h2>${esc(template.comparisonSection.title)}</h2>`);
    parts.push(`<p>${inlineMarkdownLinksToHtml(template.comparisonSection.body, esc)}</p>`);
  }

  const tipsHeading = template.tipsSectionTitle ?? "How to use it";
  parts.push(`<h2>${esc(tipsHeading)}</h2>`);
  parts.push(
    "<ol>"
      + template.steps
        .map((step) => {
          const body = inlineMarkdownLinksToHtml(step.body, esc);
          return `<li><strong>${esc(step.title)}</strong> ${body}</li>`;
        })
        .join("")
      + "</ol>",
  );

  parts.push("<h2>Frequently asked questions</h2>");
  for (const faq of template.faqs) {
    parts.push(`<h3>${esc(faq.q)}</h3>`);
    parts.push(`<p>${esc(faq.a)}</p>`);
  }

  return parts;
}
