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
  return `# ${c.h1}

> ${c.tagline}

Canonical URL: ${SITE}/compare/${c.slug}

${c.intro}

## Side-by-side

| Feature | MaintenEase | ${c.competitor} (${c.competitorPlan}) |
| --- | --- | --- |
${rows}

For the ${TEAM_SIZE}-person example, MaintenEase uses the Business plan plus additional seats for $${MAINTENEASE_TEAM_PRICE.monthlyPrice}/mo; ${c.competitor}'s listed plan is ~$${c.competitorPricePerUser}/user/mo (publicly listed pricing as of 2026 — verify with each vendor). Asset and work-order capacity can require a higher MaintenEase plan.

## Why teams switch

${c.differentiators.map((d) => `- **${d.title}** — ${d.body}`).join("\n")}

## FAQ

${c.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}
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

${g.sources?.length ? `## Sources\n\n${g.sources.map((s) => `- [${s.label}](${s.url})`).join("\n")}\n\n` : ""}${g.related?.length ? `## Related\n\n${g.related.map((r) => `- ${SITE}/learn/${r}`).join("\n")}\n` : ""}`;
}

for (const s of solutions) write(`solutions/${s.slug}.md`, solutionMd(s));
for (const c of comparisons) write(`compare/${c.slug}.md`, compareMd(c));
for (const g of glossary) write(`learn/${g.slug}.md`, glossaryMd(g));

// ---- llms.txt (index) -----------------------------------------------------

const llmsTxt = `# MaintenEase

> Modern maintenance management software (CMMS) for teams that maintain assets, buildings, and fleets. Account plans include seats and published capacity limits. Work orders, preventive maintenance, inspections, assets, and a public request portal live in one place.

${PRODUCT_PLANS.map((plan) => `${plan.name} is $${plan.monthlyPrice}/month with ${plan.includedSeats} included seats`).join("; ")}. Additional Business seats are $${EXTRA_BUSINESS_SEAT_MONTHLY}/month. ${PLAN_CAPACITY_SUMMARY} 7-day free trial. Month-to-month billing. Free data import and onboarding.

All pages below are also available as clean Markdown by appending \`.md\` (e.g. ${SITE}/solutions/work-order-software.md). See ${SITE}/llms-full.txt for the full corpus in one file.

## Product

- [Home](${SITE}/): Product overview.
- [Features](${SITE}/features): Full feature list.
- [Pricing](${SITE}/pricing): Account-plan pricing, included seats, capacity limits, and trial details.
- [CMMS cost calculator](${SITE}/cmms-cost-calculator): Estimate savings vs per-user CMMS pricing.
- [Sign in / Sign up](${SITE}/auth): Account access.

## Solutions

${solutions.map((s) => `- [${s.name}](${SITE}/solutions/${s.slug}.md): ${s.tagline}`).join("\n")}

## Comparisons

${comparisons.map((c) => `- [${c.h1}](${SITE}/compare/${c.slug}.md): ${c.tagline}`).join("\n")}

## Learn (glossary)

${glossary.map((g) => `- [${g.term}](${SITE}/learn/${g.slug}.md): ${g.short}`).join("\n")}

## Policies

- [Privacy](${SITE}/privacy)
- [Terms](${SITE}/terms)
- [Refund policy](${SITE}/refund-policy)
- [SMS opt-in](${SITE}/sms-opt-in)

## Blog

Fresh articles are published continuously. Fetch the always-current index at
[/api/blog.json](${SITE}/api/blog.json) for every post's slug, title, description,
tags, and Markdown URL. Each post is available as clean Markdown at
\`${SITE}/blog/<slug>.md\`.

- [Blog index (HTML)](${SITE}/blog)
- [Blog index (JSON, agent-friendly)](${SITE}/api/blog.json)
`;

write("llms.txt", llmsTxt);

// ---- llms-full.txt (full corpus) ------------------------------------------

const parts = [
  `# MaintenEase — Full AI-agent corpus\n\nGenerated from ${SITE}. See ${SITE}/llms.txt for the index.\n`,
  "\n\n---\n\n# Solutions\n",
  ...solutions.map(solutionMd).map((m) => `\n---\n\n${m}`),
  "\n\n---\n\n# Comparisons\n",
  ...comparisons.map(compareMd).map((m) => `\n---\n\n${m}`),
  "\n\n---\n\n# Learn\n",
  ...glossary.map(glossaryMd).map((m) => `\n---\n\n${m}`),
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
  `Wrote llms.txt, llms-full.txt, ${solutions.length} solutions, ${comparisons.length} comparisons, ${glossary.length} glossary pages.`,
);
