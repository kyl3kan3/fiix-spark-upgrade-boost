#!/usr/bin/env tsx
// Generates AI-agent-friendly artifacts under public/:
//   - llms.txt         (concise index for AI crawlers, llmstxt.org convention)
//   - llms-full.txt    (full flat corpus for LLMs that want one file)
//   - solutions/<slug>.md, compare/<slug>.md, learn/<slug>.md
//
// Run with: tsx scripts/generate-llms.ts (invoked automatically by prebuild).

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { solutions } from "../src/data/solutions";
import { comparisons, MAINTENEASE_TEAM_PRICE, TEAM_SIZE } from "../src/data/comparisons";
import { glossary } from "../src/data/glossary";
import { maintenanceTemplates } from "../src/data/maintenanceTemplates";
import {
  FACILITY_MANAGEMENT_FAQS,
  FACILITY_MANAGEMENT_KPIS,
  FACILITY_MANAGEMENT_PAGE,
  FACILITY_MANAGEMENT_PATHS,
  FACILITY_MANAGEMENT_SOURCES,
} from "../src/data/facilityManagement";
import { MCP_PAGE } from "../src/data/mcpPage";
import { STATIC_SITEMAP_ENTRIES } from "../src/data/sitemapEntries";
import { SECOND_PASS_TOOL_PAGES } from "../src/data/secondPassTools";
import {
  EXTRA_BUSINESS_SEAT_MONTHLY,
  PLAN_CAPACITY_SUMMARY,
  PLAN_SEAT_SUMMARY,
  PRODUCT_LAST_MODIFIED,
  PRODUCT_PLANS,
} from "../src/data/productCatalog";

const SITE = "https://maintenease.com";
const PUBLIC = resolve(dirname(fileURLToPath(import.meta.url)), "../public");

function write(path: string, body: string) {
  const full = resolve(PUBLIC, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, body.trimStart() + (body.endsWith("\n") ? "" : "\n"));
}

function markdownPathForPage(path: string): string {
  return path === "/" ? "/index.md" : `${path}.md`;
}

function routeLabel(path: string): string {
  if (path === "/") return "Home";
  const slug = path.split("/").filter(Boolean).at(-1) ?? "Home";
  return slug
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

// ---- Per-page markdown ----------------------------------------------------

function solutionMd(s: (typeof solutions)[number]) {
  return `# ${s.h1}

> ${s.tagline}

Canonical URL: ${SITE}/solutions/${s.slug}

${s.intro}

## Benefits

${s.benefits.map((b) => `- **${b.title}** — ${b.body}`).join("\n")}

## Features

${s.features.map((f) => `- **${f.title}** — ${f.body}`).join("\n")}

## Who it's for

${s.useCases.map((u) => `- ${u}`).join("\n")}

## FAQ

${s.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}
`;
}

function compareMd(c: (typeof comparisons)[number]) {
  const rows = c.rows
    .map((r) => {
      const fmt = (v: string | boolean) => (typeof v === "boolean" ? (v ? "Yes" : "No") : v);
      return `| ${r.feature} | ${fmt(r.ours)} | ${fmt(r.theirs)} |`;
    })
    .join("\n");
  const pricingTable = c.pricingTable
    ? `## ${c.pricingTable.heading}\n\n${c.pricingTable.summary}\n\n| Plan | ${c.competitor} price | MaintenEase price |\n| --- | --- | --- |\n${c.pricingTable.rows.map((row) => `| ${row.plan} | ${row.competitorPrice} | ${row.mainteneasePrice} |`).join("\n")}\n\nSource: [${c.pricingTable.sourceLabel}](${c.pricingTable.sourceUrl}), verified ${c.pricingTable.verifiedOn}.\n\n`
    : "";
  const competitorPrice = c.competitorPricePerUser === null
    ? `${c.competitor} requires a custom estimate and does not publish a fixed dollar price.`
    : `${c.competitor}'s listed ${c.competitorPlan} plan is $${c.competitorPricePerUser}/user/mo (publicly listed pricing as of 2026 — verify with the vendor).`;
  const narrative = c.sections?.length
    ? `\n\n${c.sections.map((section) => `## ${section.heading}\n\n${section.paragraphs.join("\n\n")}`).join("\n\n")}`
    : "";
  const vendorSources = c.sources?.length
    ? `\n\n## Vendor sources checked\n\n${c.sources.map((source) => `- [${source.label}](${source.url})`).join("\n")}`
    : "";
  return `# ${c.h1}

> ${c.tagline}

Canonical URL: ${SITE}/compare/${c.slug}

${c.intro}

${pricingTable}## Side-by-side

| Feature | MaintenEase | ${c.competitor} (${c.competitorPlan}) |
| --- | --- | --- |
${rows}

For the ${TEAM_SIZE}-person example, MaintenEase uses the Business plan plus additional seats for $${MAINTENEASE_TEAM_PRICE.monthlyPrice}/mo. ${competitorPrice} Asset and work-order capacity can require a higher MaintenEase plan.${narrative}

## Why teams switch

${c.differentiators.map((d) => `- **${d.title}** — ${d.body}`).join("\n")}

## FAQ

${c.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}${vendorSources}
`;
}

function glossaryMd(g: (typeof glossary)[number]) {
  const mdTable = (t: NonNullable<(typeof g.sections)[number]["table"]>) =>
    `\n\n${t.caption ? `_${t.caption}_\n\n` : ""}| ${t.headers.join(" | ")} |\n| ${t.headers
      .map(() => "---")
      .join(" | ")} |\n${t.rows.map((r) => `| ${r.join(" | ")} |`).join("\n")}`;
  return `# ${g.term}

> ${g.short}

Canonical URL: ${SITE}/learn/${g.slug}

${g.sections.map((s) => `## ${s.heading}\n\n${s.body}${s.table ? mdTable(s.table) : ""}`).join("\n\n")}

## FAQ

${g.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}

${g.sources?.length ? `## Sources\n\n${g.sources.map((s) => `- [${s.label}](${s.url})`).join("\n")}\n\n` : ""}${g.internalLinks?.length ? `## CMMS software and comparisons\n\n${g.internalLinks.map((link) => `- [${link.label}](${SITE}${link.href})`).join("\n")}\n\n` : ""}${g.related?.length ? `## Related\n\n${g.related.map((r) => `- ${SITE}/learn/${r}`).join("\n")}\n` : ""}`;
}

function templateMd(template: (typeof maintenanceTemplates)[number]) {
  const downloads = template.downloads ?? [{
    label: "Spreadsheet",
    format: "CSV",
    path: template.downloadPath,
  }];
  return `# ${template.h1}

> ${template.intro}

Canonical URL: ${SITE}/templates/${template.slug}

## Included fields

${template.columns.map((column) => `- **${column.name}** — ${column.purpose}`).join("\n")}

## How to use it

${template.steps.map((step, index) => `${index + 1}. **${step.title}** — ${step.body}`).join("\n")}

## FAQ

${template.faqs.map((faq) => `### ${faq.q}\n\n${faq.a}`).join("\n\n")}

## Direct downloads

${downloads.map((download) => `- [${download.label} (${download.format})](${SITE}${download.path})`).join("\n")}
`;
}

function mcpMd() {
  return `# ${MCP_PAGE.h1}

> ${MCP_PAGE.intro}

Canonical URL: ${SITE}/mcp

MCP endpoint: \`${MCP_PAGE.endpoint}\`

Server card: ${MCP_PAGE.serverCardUrl}

Transport: ${MCP_PAGE.protocol}

Authorization: ${MCP_PAGE.authorization}

## Available tools

${MCP_PAGE.tools.map((tool) => `- **\`${tool.name}\`** (${tool.access}) — ${tool.description}`).join("\n")}

## Security and access

${MCP_PAGE.safeguards.map((safeguard) => `- **${safeguard.title}** — ${safeguard.description}`).join("\n")}

## Connection flow

${MCP_PAGE.steps.map((step, index) => `${index + 1}. **${step.title}** — ${step.description}`).join("\n")}

## FAQ

${MCP_PAGE.faqs.map((faq) => `### ${faq.q}\n\n${faq.a}`).join("\n\n")}

## Machine-readable resources

- [MCP server card](${MCP_PAGE.serverCardUrl})
- [Authentication documentation](${MCP_PAGE.authDocumentationUrl})
- [Concise AI index](${SITE}/llms.txt)
- [Full AI corpus](${SITE}/llms-full.txt)
- [Structured AI catalog](${SITE}/api/ai.json)
`;
}

function facilityManagementMd() {
  return `# ${FACILITY_MANAGEMENT_PAGE.title}

> ${FACILITY_MANAGEMENT_PAGE.description}

Canonical URL: ${SITE}/facility-management

## Facility management workstreams

${FACILITY_MANAGEMENT_PATHS.map((path) => `- **${path.title}** — ${path.description}${path.href.startsWith("#") ? "" : ` [${path.cta}](${SITE}${path.href})`}`).join("\n")}

## Facility management KPIs

| KPI | Definition | Decision supported |
| --- | --- | --- |
${FACILITY_MANAGEMENT_KPIS.map((row) => `| ${row.join(" | ")} |`).join("\n")}

## FAQ

${FACILITY_MANAGEMENT_FAQS.map((faq) => `### ${faq.q}\n\n${faq.a}`).join("\n\n")}

## Sources

${FACILITY_MANAGEMENT_SOURCES.map((source) => `- [${source.label}](${source.url})`).join("\n")}
`;
}

function secondPassToolMd(page: (typeof SECOND_PASS_TOOL_PAGES)[number]) {
  return `# ${page.h1}

> ${page.intro}

Canonical URL: ${SITE}${page.path}

${page.sections.map((section) => `## ${section.heading}\n\n${section.body}`).join("\n\n")}

## FAQ

${page.faqs.map((faq) => `### ${faq.q}\n\n${faq.a}`).join("\n\n")}

## Related resources

${page.related.map((item) => `- [${item.label}](${SITE}${item.href})`).join("\n")}
`;
}

for (const s of solutions) write(`solutions/${s.slug}.md`, solutionMd(s));
for (const c of comparisons) write(`compare/${c.slug}.md`, compareMd(c));
for (const g of glossary) write(`learn/${g.slug}.md`, glossaryMd(g));
for (const template of maintenanceTemplates) write(`templates/${template.slug}.md`, templateMd(template));
for (const page of SECOND_PASS_TOOL_PAGES) write(`tools/${page.slug}.md`, secondPassToolMd(page));
write("mcp.md", mcpMd());
write("facility-management.md", facilityManagementMd());

// ---- llms.txt (index) -----------------------------------------------------

const llmsTxt = `# MaintenEase

> Modern maintenance management software (CMMS) for teams that maintain assets, buildings, and fleets. Account plans include seats and published capacity limits. Work orders, preventive maintenance, inspections, assets, and a public request portal live in one place.

${PRODUCT_PLANS.map((plan) => `${plan.name} is $${plan.monthlyPrice}/month with ${plan.includedSeats} included seats`).join("; ")}. Additional Business seats are $${EXTRA_BUSINESS_SEAT_MONTHLY}/month. ${PLAN_CAPACITY_SUMMARY} 7-day free trial. Month-to-month billing. Free data import and onboarding.

Every canonical public page below has an explicit Markdown URL. Do not guess or construct a URL: use the complete directory in this file or ${SITE}/api/ai.json. Clients may also request a canonical HTML URL with \`Accept: text/markdown\`; negotiated responses send \`Vary: Accept\`, \`Content-Location\`, and canonical/alternate \`Link\` headers. See ${SITE}/llms-full.txt for the combined corpus.

## Product

- [Home](${SITE}/index.md): Product overview.
- [Features](${SITE}/features.md): Full feature list.
- [Pricing](${SITE}/pricing.md): Account-plan pricing, included seats, capacity limits, and trial details.
- [CMMS cost calculator](${SITE}/cmms-cost-calculator.md): Estimate savings vs per-user CMMS pricing.
- [MCP server for ChatGPT and Claude](${SITE}/mcp.md): OAuth-secured CMMS tools for work orders, assets, locations, and maintenance requests.
- [Facility management guide](${SITE}/facility-management.md): Operations, maintenance, work orders, inspections, compliance, vendors, software, and KPIs.

## Solutions

${solutions.map((s) => `- [${s.name}](${SITE}/solutions/${s.slug}.md): ${s.tagline}`).join("\n")}

## Comparisons

${comparisons.map((c) => `- [${c.h1}](${SITE}/compare/${c.slug}.md): ${c.tagline}`).join("\n")}

## Learn (glossary)

${glossary.map((g) => `- [${g.term}](${SITE}/learn/${g.slug}.md): ${g.short}`).join("\n")}

## Free maintenance templates

${maintenanceTemplates.map((template) => `- [${template.title}](${SITE}/templates/${template.slug}.md): ${template.intro}`).join("\n")}

## Maintenance tools

${SECOND_PASS_TOOL_PAGES.map((page) => `- [${page.h1}](${SITE}${page.path}.md): ${page.intro}`).join("\n")}

## Policies

- [Privacy](${SITE}/privacy.md)
- [Terms](${SITE}/terms.md)
- [Refund policy](${SITE}/refund-policy.md)
- [SMS opt-in](${SITE}/sms-opt-in.md)

## Blog

Fresh articles are published continuously. Fetch the always-current index at
[/api/blog.json](${SITE}/api/blog.json) for every post's slug, title, description,
tags, and Markdown URL. Each post is available as clean Markdown at
\`${SITE}/blog/<slug>.md\`.

- [Blog index (HTML)](${SITE}/blog)
- [Blog index (Markdown)](${SITE}/blog.md)
- [Blog index (JSON, agent-friendly)](${SITE}/api/blog.json)

## Complete canonical URL directory

${STATIC_SITEMAP_ENTRIES.map((entry) => {
  const htmlUrl = entry.path === "/" ? `${SITE}/` : `${SITE}${entry.path}`;
  const markdownUrl = `${SITE}${markdownPathForPage(entry.path)}`;
  return `- **${routeLabel(entry.path)}** — HTML: ${htmlUrl} — Markdown: ${markdownUrl}`;
}).join("\n")}
`;

write("llms.txt", llmsTxt);

// ---- llms-full.txt (full corpus) ------------------------------------------

const parts = [
  `# MaintenEase — Full AI-agent corpus\n\nGenerated from ${SITE}. See ${SITE}/llms.txt for the index.\n`,
  "\n\n---\n\n# MCP server\n",
  mcpMd(),
  "\n\n---\n\n# Facility management\n",
  facilityManagementMd(),
  "\n\n---\n\n# Solutions\n",
  ...solutions.map(solutionMd).map((m) => `\n---\n\n${m}`),
  "\n\n---\n\n# Comparisons\n",
  ...comparisons.map(compareMd).map((m) => `\n---\n\n${m}`),
  "\n\n---\n\n# Learn\n",
  ...glossary.map(glossaryMd).map((m) => `\n---\n\n${m}`),
  "\n\n---\n\n# Templates\n",
  ...maintenanceTemplates.map(templateMd).map((m) => `\n---\n\n${m}`),
  "\n\n---\n\n# Maintenance tools\n",
  ...SECOND_PASS_TOOL_PAGES.map(secondPassToolMd).map((m) => `\n---\n\n${m}`),
];
write("llms-full.txt", parts.join(""));

// ---- api/ai.json (structured index for agents) ----------------------------

const apiContent = {
  name: "MaintenEase",
  description:
    "Modern maintenance management software (CMMS) with account plans, included seats, and published capacity limits.",
  site: SITE,
  llms_txt: `${SITE}/llms.txt`,
  llms_full_txt: `${SITE}/llms-full.txt`,
  content_negotiation: {
    request_header: "Accept: text/markdown",
    varies_on: "Accept",
    response_headers: ["Content-Location", "Link"],
  },
  pages: STATIC_SITEMAP_ENTRIES.map((entry) => ({
    path: entry.path,
    html_url: entry.path === "/" ? `${SITE}/` : `${SITE}${entry.path}`,
    markdown_url: `${SITE}${markdownPathForPage(entry.path)}`,
  })),
  mcp: {
    html_url: `${SITE}/mcp`,
    markdown_url: `${SITE}/mcp.md`,
    endpoint: MCP_PAGE.endpoint,
    server_card_url: MCP_PAGE.serverCardUrl,
    auth_documentation_url: MCP_PAGE.authDocumentationUrl,
    transport: MCP_PAGE.protocol,
    authorization: MCP_PAGE.authorization,
    tools: MCP_PAGE.tools.map((tool) => ({
      name: tool.name,
      access: tool.access,
      description: tool.description,
    })),
  },
  pricing: {
    model: "account_plans_with_included_seats",
    currency: "USD",
    date_modified: PRODUCT_LAST_MODIFIED,
    trial_days: 7,
    billing: "month-to-month",
    seat_summary: PLAN_SEAT_SUMMARY,
    capacity_summary: PLAN_CAPACITY_SUMMARY,
    plans: PRODUCT_PLANS.map((plan) => ({
      name: plan.name,
      monthly_price: plan.monthlyPrice,
      annual_price: plan.annualPrice,
      included_seats: plan.includedSeats,
      additional_seat_monthly_price: plan.extraSeatMonthlyPrice,
      asset_limit: plan.assetLimit,
      monthly_work_order_limit: plan.monthlyWorkOrderLimit,
    })),
  },
  solutions: solutions.map((s) => ({
    slug: s.slug,
    name: s.name,
    tagline: s.tagline,
    html_url: `${SITE}/solutions/${s.slug}`,
    markdown_url: `${SITE}/solutions/${s.slug}.md`,
  })),
  comparisons: comparisons.map((c) => ({
    slug: c.slug,
    competitor: c.competitor,
    competitor_plan: c.competitorPlan,
    competitor_price_per_user_usd: c.competitorPricePerUser,
    html_url: `${SITE}/compare/${c.slug}`,
    markdown_url: `${SITE}/compare/${c.slug}.md`,
  })),
  glossary: glossary.map((g) => ({
    slug: g.slug,
    term: g.term,
    short: g.short,
    html_url: `${SITE}/learn/${g.slug}`,
    markdown_url: `${SITE}/learn/${g.slug}.md`,
  })),
  templates: maintenanceTemplates.map((template) => ({
    slug: template.slug,
    name: template.title,
    html_url: `${SITE}/templates/${template.slug}`,
    markdown_url: `${SITE}/templates/${template.slug}.md`,
    formats: (template.downloads ?? [{ format: "CSV", path: template.downloadPath }]).map((download) => ({
      format: download.format,
      download_url: `${SITE}${download.path}`,
    })),
  })),
  blog: {
    index_html_url: `${SITE}/blog`,
    index_json_url: `${SITE}/api/blog.json`,
    markdown_url_pattern: `${SITE}/blog/{slug}.md`,
    note: "Posts are dynamic — fetch /api/blog.json for the current list.",
  },
};

let generatedAt = new Date().toISOString();
try {
  const existing = JSON.parse(
    readFileSync(resolve(PUBLIC, "api/ai.json"), "utf8"),
  ) as Record<string, unknown>;
  const { generated_at: existingGeneratedAt, ...existingContent } = existing;
  if (
    typeof existingGeneratedAt === "string" &&
    JSON.stringify(existingContent) === JSON.stringify(apiContent)
  ) {
    generatedAt = existingGeneratedAt;
  }
} catch {
  // A missing or invalid file is replaced below.
}

const { name, description, site, ...apiRemainder } = apiContent;
const apiJson = {
  name,
  description,
  site,
  generated_at: generatedAt,
  ...apiRemainder,
};
write("api/ai.json", JSON.stringify(apiJson, null, 2));

console.log(
  `Wrote llms.txt, llms-full.txt, the MCP page, ${solutions.length} solutions, ${comparisons.length} comparisons, ${glossary.length} glossary pages, ${maintenanceTemplates.length} templates, and ${SECOND_PASS_TOOL_PAGES.length} maintenance tools.`,
);
