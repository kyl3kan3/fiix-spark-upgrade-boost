/**
 * Static prerender for crawler-facing marketing routes.
 *
 * This app is a client-rendered SPA, so a crawler that does not execute
 * JavaScript sees only the shell in index.html — no <h1>, no per-route
 * <title>/description. This script runs after `vite build` and writes a
 * per-route `dist/<path>/index.html` whose <head> carries that route's real
 * title/description/canonical/og tags and whose #root contains a static
 * content shell (H1 + intro + links) for no-JS crawlers.
 *
 * React mounts with createRoot().render(), which replaces the container's
 * children, so the shell is discarded the moment JS runs. Nothing about the
 * interactive app changes.
 */
import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { solutions } from "../src/data/solutions";
import { glossary } from "../src/data/glossary";
import { comparisons } from "../src/data/comparisons";

const DIST = resolve("dist");
const ORIGIN = "https://maintenease.com";
const OG_IMAGE = `${ORIGIN}/og-image.png?v=4`;

type Route = {
  path: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  /** Extra crawlable body copy (headings/paragraphs), already escaped-safe text. */
  sections?: { heading: string; body: string }[];
  links?: { href: string; label: string }[];
};

const esc = (s: string) =>
  s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const staticRoutes: Route[] = [
  {
    path: "/",
    title: "MaintenEase — CMMS Software to Prevent Downtime",
    description:
      "CMMS for facility & maintenance teams. Track work orders, assets & inspections, and prevent downtime with predictive AI. Flat pricing from $49/mo.",
    h1: "CMMS Software for Facility & Maintenance Teams",
    intro:
      "Track work orders, assets, and inspections in one place, and prevent downtime with predictive maintenance — flat pricing starting at $49/mo.",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/features", label: "Features" },
      { href: "/solutions", label: "Solutions" },
      { href: "/learn", label: "Learn" },
      { href: "/compare", label: "Compare CMMS software" },
      { href: "/cmms-cost-calculator", label: "CMMS cost calculator" },
      { href: "/blog", label: "Blog" },
    ],
  },
  {
    path: "/landing",
    title: "MaintenEase — Stop Downtime Before It Starts",
    description:
      "Techs stop losing work between texts and whiteboards. Owners stop guessing what is actually done.",
    h1: "Stop downtime before it starts.",
    intro:
      "Techs stop losing work between texts and whiteboards. Owners stop guessing what is actually done.",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/features", label: "Features" },
    ],
  },
  {
    path: "/pricing",
    title: "CMMS Pricing — Flat $49/mo, No Per-Seat Fees | MaintenEase",
    description:
      "Simple flat-fee CMMS pricing: Starter $49/mo, Pro $129/mo, Business $299/mo. Unlimited work orders and assets, 7-day free trial.",
    h1: "CMMS pricing without per-seat surprises",
    intro:
      "Starter is $49/mo, Pro is $129/mo, and Business is $299/mo. Every plan includes unlimited work orders and assets, free onboarding, and a 7-day free trial.",
    links: [{ href: "/cmms-cost-calculator", label: "Estimate your savings" }],
  },
  {
    path: "/features",
    title: "CMMS Features — Work Orders, Assets, PM & Reports | MaintenEase",
    description:
      "Explore MaintenEase CMMS features: mobile work orders, asset registry, preventive maintenance scheduling, inspections, and cost reporting.",
    h1: "Everything your maintenance team needs in one CMMS",
    intro:
      "Mobile work orders, a complete asset registry, preventive maintenance scheduling, digital inspections, predictive alerts, and cost reporting.",
  },
  {
    path: "/maintenance-simplified",
    title: "Maintenance Simplified — A Playbook for Small Teams | MaintenEase",
    description:
      "Maintenance simplified: a practical playbook for small teams — six principles, a starter checklist, and the numbers that prove it works.",
    h1: "Maintenance simplified: a playbook for small teams",
    intro:
      "Six principles, a starter checklist, and a cost calculator to simplify maintenance without adding overhead.",
  },
  {
    path: "/solutions",
    title: "CMMS Solutions by Use Case | MaintenEase",
    description:
      "Work order software, preventive maintenance, asset tracking, facility and fleet maintenance — see how MaintenEase fits your use case.",
    h1: "CMMS solutions by use case",
    intro: "Purpose-built solutions for work orders, preventive maintenance, assets, facilities, and fleets.",
    links: solutions.map((s) => ({ href: `/solutions/${s.slug}`, label: s.name })),
  },
  {
    path: "/learn",
    title: "Maintenance Glossary & Guides | MaintenEase",
    description:
      "Plain-English guides to CMMS, preventive and predictive maintenance, MTBF, MTTR, root cause analysis, and maintenance benchmarks.",
    h1: "Maintenance glossary and guides",
    intro: "Plain-English explanations of the terms, metrics, and strategies maintenance teams actually use.",
    links: glossary.map((g) => ({ href: `/learn/${g.slug}`, label: g.term })),
  },
  {
    path: "/compare",
    title: "MaintenEase vs Other CMMS Platforms — Honest Comparisons",
    description:
      "Compare MaintenEase with UpKeep, Limble, Fiix, MaintainX, and eMaint on pricing model, features, and total cost for a team of eight.",
    h1: "MaintenEase compared with other CMMS platforms",
    intro:
      "Every competitor here bills per user. MaintenEase charges one flat fee — see what that means for a team of eight.",
    links: [
      ...comparisons.map((c) => ({ href: `/compare/${c.slug}`, label: `MaintenEase vs ${c.competitor}` })),
      { href: "/cmms-cost-calculator", label: "CMMS cost calculator" },
    ],
  },
  {
    path: "/cmms-cost-calculator",
    title: "CMMS Cost Calculator — Per-Seat vs Flat Fee | MaintenEase",
    description:
      "Free CMMS cost calculator. Enter team size and per-seat pricing to see your annual software cost versus MaintenEase flat-fee plans.",
    h1: "CMMS cost calculator",
    intro:
      "Enter your team size and current per-seat price to see annual CMMS cost, MaintenEase flat-fee cost, and your projected savings.",
    links: [{ href: "/compare", label: "Compare CMMS platforms" }],
  },
  {
    path: "/blog",
    title: "MaintenEase Blog — Maintenance & CMMS Insights",
    description:
      "Articles on maintenance management, CMMS adoption, preventive maintenance strategy, and reducing unplanned downtime.",
    h1: "MaintenEase blog",
    intro: "Practical writing on maintenance management, CMMS adoption, and reducing unplanned downtime.",
  },
];

const solutionRoutes: Route[] = solutions.map((s) => ({
  path: `/solutions/${s.slug}`,
  title: s.metaTitle,
  description: s.metaDescription,
  h1: s.h1,
  intro: s.intro,
  sections: [
    ...s.benefits.map((b) => ({ heading: b.title, body: b.body })),
    ...s.features.map((f) => ({ heading: f.title, body: f.body })),
    ...s.faqs.map((f) => ({ heading: f.q, body: f.a })),
  ],
  links: [{ href: "/solutions", label: "All solutions" }, { href: "/pricing", label: "Pricing" }],
}));

const learnRoutes: Route[] = glossary.map((g) => ({
  path: `/learn/${g.slug}`,
  title: g.metaTitle,
  description: g.metaDescription,
  h1: g.term,
  intro: g.short,
  sections: [
    ...g.sections.map((s) => ({ heading: s.heading, body: s.body })),
    ...g.faqs.map((f) => ({ heading: f.q, body: f.a })),
  ],
  links: [
    { href: "/learn", label: "All guides" },
    ...g.related.map((slug) => ({ href: `/learn/${slug}`, label: slug.replace(/-/g, " ") })),
  ],
}));

const compareRoutes: Route[] = comparisons.map((c) => ({
  path: `/compare/${c.slug}`,
  title: c.metaTitle,
  description: c.metaDescription,
  h1: c.h1,
  intro: c.intro,
  sections: [
    ...c.differentiators.map((d) => ({ heading: d.title, body: d.body })),
    ...c.faqs.map((f) => ({ heading: f.q, body: f.a })),
  ],
  links: [{ href: "/compare", label: "All comparisons" }, { href: "/pricing", label: "Pricing" }],
}));

const routes: Route[] = [...staticRoutes, ...solutionRoutes, ...learnRoutes, ...compareRoutes];

const shell = readFileSync(join(DIST, "index.html"), "utf8");

function headFor(route: Route): string {
  const canonical = route.path === "/" ? `${ORIGIN}/` : `${ORIGIN}${route.path}`;
  const title = esc(route.title);
  const description = esc(route.description);
  return [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" data-rh="true" />`,
    `<link data-rh="true" rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
  ].join("\n    ");
}

function bodyFor(route: Route): string {
  const parts = [
    `<h1>${esc(route.h1)}</h1>`,
    `<p>${esc(route.intro)}</p>`,
    ...(route.sections ?? []).slice(0, 12).flatMap((s) => [
      `<h2>${esc(s.heading)}</h2>`,
      `<p>${esc(s.body)}</p>`,
    ]),
  ];
  if (route.links?.length) {
    parts.push(
      "<nav><ul>" +
        route.links
          .map((l) => `<li><a href="${esc(l.href)}">${esc(l.label)}</a></li>`)
          .join("") +
        "</ul></nav>",
    );
  }
  // data-prerender marks the shell; React discards it on mount.
  return `<div data-prerender="static">${parts.join("\n      ")}</div>`;
}

function renderRoute(route: Route): string {
  let html = shell;

  // Replace the shell's title / description / canonical with route-specific tags.
  html = html.replace(/<title>[\s\S]*?<\/title>\s*/, "");
  html = html.replace(/<meta name="description"[^>]*>\s*/, "");
  html = html.replace(/<link[^>]*rel="canonical"[^>]*>\s*/, "");
  html = html.replace(/<meta property="og:(?:type|title|description|url)"[^>]*>\s*/g, "");
  html = html.replace(/<meta name="twitter:(?:card|title|description)"[^>]*>\s*/g, "");
  html = html.replace("</head>", `  ${headFor(route)}\n  </head>`);

  html = html.replace('<div id="root"></div>', `<div id="root">${bodyFor(route)}</div>`);
  return html;
}

let written = 0;
for (const route of routes) {
  const outPath =
    route.path === "/"
      ? join(DIST, "index.html")
      : join(DIST, route.path.replace(/^\//, ""), "index.html");
  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, renderRoute(route));
  written++;
}

console.log(`[prerender] wrote ${written} static route documents → dist/`);
