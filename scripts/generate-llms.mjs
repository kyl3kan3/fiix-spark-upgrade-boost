#!/usr/bin/env bun
// Generates AI-agent-friendly artifacts under public/:
//   - llms.txt         (concise index for AI crawlers, llmstxt.org convention)
//   - llms-full.txt    (full flat corpus for LLMs that want one file)
//   - solutions/<slug>.md, compare/<slug>.md, learn/<slug>.md
//
// Run with: bun scripts/generate-llms.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { dirname, resolve } from "node:path";

const { solutions } = await import("../src/data/solutions.ts");
const { comparisons, MAINTENEASE_PRO } = await import("../src/data/comparisons.ts");
const { glossary } = await import("../src/data/glossary.ts");

const SITE = "https://maintenease.com";
const PUBLIC = resolve(import.meta.dir ?? new URL(".", import.meta.url).pathname, "../public");

function write(path, body) {
  const full = resolve(PUBLIC, path);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, body.trimStart() + (body.endsWith("\n") ? "" : "\n"));
}

// ---- Per-page markdown ----------------------------------------------------

function solutionMd(s) {
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

function compareMd(c) {
  const rows = c.rows
    .map((r) => {
      const fmt = (v) => (typeof v === "boolean" ? (v ? "Yes" : "No") : v);
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

MaintenEase Pro is a flat $${MAINTENEASE_PRO}/mo for the whole team; ${c.competitor}'s listed plan is ~$${c.competitorPricePerUser}/user/mo (publicly listed pricing as of 2026 — verify with each vendor).

## Why teams switch

${c.differentiators.map((d) => `- **${d.title}** — ${d.body}`).join("\n")}

## FAQ

${c.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}
`;
}

function glossaryMd(g) {
  return `# ${g.term}

> ${g.short}

Canonical URL: ${SITE}/learn/${g.slug}

${g.sections.map((s) => `## ${s.heading}\n\n${s.body}`).join("\n\n")}

## FAQ

${g.faqs.map((f) => `### ${f.q}\n\n${f.a}`).join("\n\n")}

${g.related?.length ? `## Related\n\n${g.related.map((r) => `- ${SITE}/learn/${r}`).join("\n")}\n` : ""}`;
}

for (const s of solutions) write(`solutions/${s.slug}.md`, solutionMd(s));
for (const c of comparisons) write(`compare/${c.slug}.md`, compareMd(c));
for (const g of glossary) write(`learn/${g.slug}.md`, glossaryMd(g));

// ---- llms.txt (index) -----------------------------------------------------

const llmsTxt = `# MaintenEase

> Modern maintenance management software (CMMS) for teams that maintain assets, buildings, and fleets. Flat monthly pricing instead of per-user seats. Work orders, preventive maintenance, inspections, assets, and a public request portal in one place.

MaintenEase Pro is a flat $${MAINTENEASE_PRO}/month for the whole team. 7-day free trial. Month-to-month billing. Free data import and onboarding.

All pages below are also available as clean Markdown by appending \`.md\` (e.g. ${SITE}/solutions/work-order-software.md). See ${SITE}/llms-full.txt for the full corpus in one file.

## Product

- [Home](${SITE}/): Product overview.
- [Features](${SITE}/features): Full feature list.
- [Pricing](${SITE}/pricing): Flat monthly pricing and trial details.
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

console.log(
  `Wrote llms.txt, llms-full.txt, ${solutions.length} solutions, ${comparisons.length} comparisons, ${glossary.length} glossary pages.`,
);