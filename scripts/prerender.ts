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
import { comparisons, getFaqSchemaEntries } from "../src/data/comparisons";
import {
  BRAND_JSON_LD,
  ORGANIZATION_JSON_LD,
  PRODUCT_JSON_LD,
  PRODUCT_LAST_MODIFIED,
  SOFTWARE_APPLICATION_JSON_LD,
  WEBSITE_JSON_LD,
  buildItemListJsonLd,
} from "../src/data/productCatalog";

const DIST = resolve("dist");
const ORIGIN = "https://maintenease.com";
const OG_IMAGE = `${ORIGIN}/og-image.png?v=4`;
const FEATURE_ITEMS = [
  ["Work Order Management", "Create, assign, and track work orders from one shared queue."],
  ["Preventive Maintenance", "Schedule recurring maintenance and generate planned work orders."],
  ["Asset Management", "Keep equipment details, documents, and maintenance history together."],
  ["Predictive Maintenance", "Use risk scoring on eligible plans to prioritize inspections and planned work."],
  ["Team Collaboration", "Coordinate assignments, updates, and notifications across the maintenance team."],
  ["Performance Analytics", "Review maintenance reports and operational KPIs on eligible plans."],
  ["Downtime Tracking", "Record equipment downtime and compare recurring interruptions."],
] as const;
const MAINTENANCE_SIMPLIFIED_FAQS = [
  ["What does 'maintenance simplified' actually mean?", "It means running preventive maintenance, work orders, and requests from one system with one shared view — instead of juggling spreadsheets, whiteboards, group texts, and paper. The goal is fewer tools, clearer ownership, and reports the owner can trust."],
  ["How do small teams simplify maintenance without a big rollout?", "Start with a single week of requests in one inbox, a PM schedule for your top 20 critical assets, and a QR request link staff can scan. Add more assets and workflows as the basics stick."],
  ["Do I need a full CMMS to simplify maintenance?", "A shared spreadsheet can work while one person manages a small asset list. A CMMS becomes more practical when several people update work, recurring PMs need to generate reliably, or the team needs one service history for each asset."],
  ["How is MaintenEase different from spreadsheets?", "Requests, PMs, work orders, assets, and reports live in one place with mobile access. PMs auto-generate, techs check off work from their phone, and owners see backlog and spend without asking for a report."],
  ["What does simplified maintenance cost?", "MaintenEase starts at $49/month for a Starter account with two included seats and a 7-day free trial. Pro is $129/month with four included seats. Business is $299/month with four included seats, unlimited assets, and unlimited work orders; additional Business seats are $15/month."],
  ["Does MaintenEase include unlimited assets and work orders?", "Yes, on the Business plan. Starter supports up to 50 assets and 100 work orders per month, while Pro supports up to 500 assets and 2,000 work orders per month. The pricing page lists the current limits for every plan."],
] as const;

type Route = {
  path: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  ogType?: "website" | "article";
  jsonLd?: Record<string, unknown>[];
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
      "CMMS for facility and maintenance teams. Track work orders, assets, inspections, and equipment risk with account plans from $49/month.",
    h1: "CMMS Software for Facility & Maintenance Teams",
    intro:
      "Track work orders, assets, and inspections in one place, and act earlier with predictive maintenance on eligible plans. Account plans start at $49 per month.",
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
      "See how MaintenEase helps technicians manage work orders, preventive maintenance, assets, and costs—so teams prevent downtime and prove what gets done.",
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
    title: "CMMS Pricing — Account Plans from $49/mo | MaintenEase",
    description:
      "MaintenEase pricing: Starter $49/month, Pro $129/month, and Business $299/month, with included seats, published limits, and a 7-day trial.",
    h1: "CMMS pricing without per-seat surprises",
    intro:
      "Starter is $49/month with 2 seats, Pro is $129/month with 4 seats, and Business is $299/month with 4 seats. Business adds seats for $15/month and includes unlimited assets and work orders.",
    links: [{ href: "/cmms-cost-calculator", label: "Estimate your savings" }],
  },
  {
    path: "/features",
    title: "CMMS Features — Work Orders, Assets & PM | MaintenEase",
    description:
      "Explore MaintenEase CMMS features: mobile work orders, asset registry, preventive maintenance scheduling, inspections, and cost reporting.",
    h1: "Everything your maintenance team needs in one CMMS",
    intro:
      "Mobile work orders, a complete asset registry, preventive maintenance scheduling, digital inspections, predictive alerts, and cost reporting.",
    jsonLd: [buildItemListJsonLd(
      "MaintenEase CMMS features",
      `${ORIGIN}/features`,
      FEATURE_ITEMS.map(([name, description]) => ({ name, url: `${ORIGIN}/features`, description })),
    )],
  },
  {
    path: "/maintenance-simplified",
    title: "Maintenance Simplified: A Playbook for Small Teams",
    description:
      "Maintenance simplified: a practical playbook for small teams — six principles, a starter checklist, and the numbers that prove it works.",
    h1: "Maintenance simplified: a playbook for small teams",
    intro:
      "Maintenance gets messy when work lives in five places at once. Simplify it with one request queue, one preventive-maintenance calendar, one asset history, and one view of emerging equipment risk.",
    ogType: "article",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: "Maintenance Simplified: A Playbook for Small Teams",
        description: "Maintenance simplified: a practical playbook for small teams — six principles, a starter checklist, and the numbers that prove it works.",
        mainEntityOfPage: `${ORIGIN}/maintenance-simplified`,
        image: OG_IMAGE,
        dateModified: PRODUCT_LAST_MODIFIED,
        author: { "@id": `${ORIGIN}/#organization` },
        publisher: { "@id": `${ORIGIN}/#organization` },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: MAINTENANCE_SIMPLIFIED_FAQS.map(([name, answer]) => ({
          "@type": "Question",
          name,
          acceptedAnswer: { "@type": "Answer", text: answer },
        })),
      },
    ],
    sections: [
      {
        heading: "What needs attention now?",
        body: "Put requests, corrective work, and preventive tasks in one queue. Give every item an owner, priority, due date, and status so the crew can start the day without checking texts, paper notes, and separate spreadsheets.",
      },
      {
        heading: "What cannot be allowed to fail?",
        body: "Identify the assets whose failure would stop production, close a space, create a safety issue, or delay customers. Attach manuals and service history, then schedule the basic inspections and preventive work those assets require.",
      },
      {
        heading: "What is becoming risky?",
        body: "Review repeat failures, falling time between failures, overdue preventive work, condition readings, repair cost, and downtime. These signals help the team inspect the right equipment before a developing problem becomes an interruption.",
      },
      {
        heading: "One list, not five",
        body: "Every request, preventive-maintenance task, and repair lives on one prioritized board so nothing falls between texts, whiteboards, and inboxes.",
      },
      {
        heading: "Preventive maintenance on autopilot",
        body: "Set the interval once. Recurring preventive maintenance automatically generates work orders and assigns the right technician.",
      },
      {
        heading: "Requests without training",
        body: "A public QR link lets tenants and staff submit issues with no login, app installation, or phone tag.",
      },
      {
        heading: "Assets that tell their story",
        body: "Each asset carries its manuals, warranty, preventive-maintenance history, and cost so the next technician is not starting from zero.",
      },
      {
        heading: "Reports the owner can use",
        body: "MTBF, MTTR, backlog, and spend appear on one dashboard so the team can answer whether maintenance is under control.",
      },
      {
        heading: "Account-level plans",
        body: "Choose one plan for the account instead of multiplying a subscription price by every user. Published plan limits keep the tradeoffs visible before you buy.",
      },
      {
        heading: "Flat account pricing, with clear plan limits",
        body: "MaintenEase starts at $49 per month for a Starter account with two included seats. Pro is $129 per month with four included seats. Business is $299 per month with four included seats, and additional Business seats are $15 per month. The base subscription is selected for the account rather than calculated by multiplying one advertised price by every technician.",
      },
      {
        heading: "Unlimited work orders and assets on Business",
        body: "The Business plan includes unlimited assets and unlimited work orders. Starter supports up to 50 assets and 100 work orders per month; Pro supports up to 500 assets and 2,000 work orders per month. That makes capacity a visible plan choice instead of a surprise after setup.",
      },
      {
        heading: "Predictive maintenance for earlier action",
        body: "Pro and Business include failure-risk scoring based on recorded work history and condition data. Each asset receives a 0–100 risk score with the factors behind it, helping supervisors prioritize inspections and planned work. The score supports a maintenance decision; it does not replace a technician's diagnosis.",
      },
    ],
    links: [
      { href: "/pricing", label: "Review pricing and plan limits" },
      { href: "/cmms-cost-calculator", label: "Compare account and per-seat costs" },
      { href: "/learn/predictive-maintenance", label: "Learn how predictive maintenance works" },
    ],
  },
  {
    path: "/solutions",
    title: "CMMS Solutions by Use Case | MaintenEase",
    description:
      "Work order software, preventive maintenance, asset tracking, facility and fleet maintenance — see how MaintenEase fits your use case.",
    h1: "CMMS solutions by use case",
    intro: "Purpose-built solutions for work orders, preventive maintenance, assets, facilities, and fleets.",
    links: solutions.map((s) => ({ href: `/solutions/${s.slug}`, label: s.name })),
    jsonLd: [buildItemListJsonLd(
      "MaintenEase CMMS solutions",
      `${ORIGIN}/solutions`,
      solutions.map((solution) => ({ name: solution.name, url: `${ORIGIN}/solutions/${solution.slug}`, description: solution.tagline })),
    )],
  },
  {
    path: "/learn",
    title: "Maintenance Glossary & Guides | MaintenEase",
    description:
      "Plain-English guides to CMMS, preventive and predictive maintenance, MTBF, MTTR, root cause analysis, and maintenance benchmarks.",
    h1: "Maintenance glossary and guides",
    intro: "Plain-English explanations of the terms, metrics, and strategies maintenance teams actually use.",
    links: glossary.map((g) => ({ href: `/learn/${g.slug}`, label: g.term })),
    jsonLd: [buildItemListJsonLd(
      "MaintenEase maintenance glossary",
      `${ORIGIN}/learn`,
      glossary.map((entry) => ({ name: entry.term, url: `${ORIGIN}/learn/${entry.slug}`, description: entry.short })),
    )],
  },
  {
    path: "/compare",
    title: "MaintenEase vs Other CMMS Platforms — Honest Comparisons",
    description:
      "Compare MaintenEase with UpKeep, Limble, Fiix, MaintainX, and eMaint on pricing model, features, and total cost for a team of eight.",
    h1: "MaintenEase compared with other CMMS platforms",
    intro:
      "Compare each competitor's listed per-user price with MaintenEase account plans, included seats, capacity limits, and Business extra seats for a team of eight.",
    links: [
      ...comparisons.map((c) => ({ href: `/compare/${c.slug}`, label: `MaintenEase vs ${c.competitor}` })),
      { href: "/cmms-cost-calculator", label: "CMMS cost calculator" },
    ],
  },
  {
    path: "/cmms-cost-calculator",
    title: "CMMS Cost Calculator — Per-Seat vs Account Plans | MaintenEase",
    description:
      "Free CMMS cost calculator comparing published per-seat prices with MaintenEase account plans and included seats.",
    h1: "CMMS cost calculator",
    intro:
      "Choose a team size to compare listed per-seat CMMS costs with the lowest MaintenEase plan that covers those seats.",
    links: [
      { href: "/compare", label: "Compare CMMS platforms" },
      {
        href: "/compare/maintenease-vs-maintainx",
        label: "See the MaintenEase vs MaintainX cost comparison",
      },
    ],
  },
  {
    path: "/blog",
    title: "MaintenEase Blog — Maintenance & CMMS Insights",
    description:
      "Articles on maintenance management, CMMS adoption, preventive maintenance strategy, and reducing unplanned downtime.",
    h1: "MaintenEase blog",
    intro: "Practical writing on maintenance management, CMMS adoption, and reducing unplanned downtime.",
  },
  // These routes ship in the sitemap, so they need their own canonical in the
  // no-JS HTML — otherwise they inherit the homepage canonical from the shell
  // and get flagged as non-canonical pages in the sitemap.
  {
    path: "/auth",
    title: "Sign in or create your account | MaintenEase",
    description:
      "Sign in to MaintenEase or create an account to manage assets, work orders, inspections, and your maintenance team in one place.",
    h1: "Sign in or create your MaintenEase account",
    intro:
      "Access your MaintenEase workspace to manage assets, work orders, inspections, and your maintenance team.",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/features", label: "Features" },
    ],
  },
  {
    path: "/privacy",
    title: "Privacy Notice | MaintenEase",
    description:
      "How MaintenEase collects, uses, stores, and protects your personal data, plus the choices and rights you have over that information.",
    h1: "Privacy Notice",
    intro:
      "How MaintenEase collects, uses, stores, and protects your personal data, and the rights you have over that information.",
    links: [
      { href: "/terms", label: "Terms of service" },
      { href: "/", label: "Home" },
    ],
  },
  {
    path: "/terms",
    title: "Terms & Conditions | MaintenEase",
    description:
      "The terms and conditions that govern your use of MaintenEase, including subscriptions, acceptable use, liability, and account termination.",
    h1: "Terms & Conditions",
    intro:
      "The terms governing your use of MaintenEase, including subscriptions, acceptable use, and account termination.",
    links: [
      { href: "/privacy", label: "Privacy notice" },
      { href: "/refund-policy", label: "Refund policy" },
    ],
  },
  {
    path: "/refund-policy",
    title: "Refund Policy | MaintenEase",
    description:
      "MaintenEase refund policy: how the 7-day free trial works, how billing cancellations are handled, and when refunds are issued.",
    h1: "Refund Policy",
    intro:
      "How the 7-day free trial works, how cancellations are handled, and when MaintenEase issues refunds.",
    links: [
      { href: "/pricing", label: "Pricing" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
  {
    path: "/sms-opt-in",
    title: "SMS Notifications & Opt-In | MaintenEase",
    description:
      "How MaintenEase SMS notifications work: what messages we send, how to opt in or out, message frequency, and carrier charge information.",
    h1: "SMS notifications and opt-in",
    intro:
      "What MaintenEase texts you about, how to opt in or out at any time, and how message frequency and carrier charges work.",
    links: [
      { href: "/privacy", label: "Privacy notice" },
      { href: "/terms", label: "Terms of service" },
    ],
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

const learnRoutes: Route[] = glossary.map((g) => {
  const url = `${ORIGIN}/learn/${g.slug}`;
  return {
    path: `/learn/${g.slug}`,
    title: g.metaTitle,
    description: g.metaDescription,
    h1: g.term,
    intro: g.short,
    ogType: "article",
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: g.term,
        description: g.short,
        mainEntityOfPage: { "@type": "WebPage", "@id": url },
        inLanguage: "en",
        image: OG_IMAGE,
        author: { "@type": "Organization", name: "MaintenEase" },
        publisher: {
          "@type": "Organization",
          name: "MaintenEase",
          logo: { "@type": "ImageObject", url: `${ORIGIN}/favicon.png` },
        },
        ...(g.published ? { datePublished: g.published } : {}),
        ...(g.updated ? { dateModified: g.updated } : {}),
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: g.faqs.map((f) => ({
          "@type": "Question",
          name: f.q,
          acceptedAnswer: { "@type": "Answer", text: f.a },
        })),
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Learn", item: `${ORIGIN}/learn` },
          { "@type": "ListItem", position: 2, name: g.term, item: url },
        ],
      },
    ],
    sections: [
      ...g.sections.map((s) => ({ heading: s.heading, body: s.body })),
      ...g.faqs.map((f) => ({ heading: f.q, body: f.a })),
    ],
    links: [
      { href: "/learn", label: "All guides" },
      ...g.related.map((slug) => ({ href: `/learn/${slug}`, label: slug.replace(/-/g, " ") })),
      ...(g.sources ?? []).map((source) => ({ href: source.url, label: source.label })),
    ],
  };
});

const compareRoutes: Route[] = comparisons.map((c) => ({
  path: `/compare/${c.slug}`,
  title: c.metaTitle,
  description: c.metaDescription,
  h1: c.h1,
  intro: c.intro,
  sections: [
    ...(c.sections ?? []).map((s) => ({ heading: s.heading, body: s.paragraphs.join(" ") })),
    ...c.differentiators.map((d) => ({ heading: d.title, body: d.body })),
    ...c.faqs.map((f) => ({ heading: f.q, body: f.a })),
  ],
  links: [
    { href: "/compare", label: "All comparisons" },
    { href: "/pricing", label: "Pricing" },
    ...(["maintenease-vs-upkeep", "maintenease-vs-fiix"].includes(c.slug)
      ? [{
          href: "/compare/maintenease-vs-maintainx",
          label: "Compare MaintenEase with MaintainX",
        }]
      : []),
  ],
  ...(c.slug === "maintenease-vs-maintainx"
    ? {
        jsonLd: [
          {
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: getFaqSchemaEntries(c).map((faq) => ({
              "@type": "Question",
              name: faq.q,
              acceptedAnswer: { "@type": "Answer", text: faq.a },
            })),
          },
        ],
      }
    : {}),
}));

const routes: Route[] = [...staticRoutes, ...solutionRoutes, ...learnRoutes, ...compareRoutes];

/* ------------------------------------------------------------------ blog --
 * Blog posts live in the database, so a no-JS crawler sees an empty shell:
 * no <h1>, no description, no OG tags, ~0 words, and the index links to
 * nothing (which orphans every post). Fetch them at build time and emit the
 * same static shell used for the file-backed routes.
 */
const SUPABASE_URL = "https://wwgljhpuulhljumrhscg.supabase.co";
const SUPABASE_ANON =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Ind3Z2xqaHB1dWxobGp1bXJoc2NnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkxMTgzOTAsImV4cCI6MjA5NDY5NDM5MH0.21tgSpPihdVl5XE9pFpwFzvaD2I05DE7uGzkuI7u6ac";

type BlogRow = {
  slug: string;
  title: string;
  meta_description: string | null;
  content_html: string | null;
};

const stripHtml = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/\s+/g, " ")
    .trim();

function chunk(text: string, size: number, count: number): string[] {
  const words = text.split(" ");
  const out: string[] = [];
  for (let i = 0; i < words.length && out.length < count; i += size) {
    out.push(words.slice(i, i + size).join(" "));
  }
  return out;
}

async function fetchBlogPosts(): Promise<BlogRow[]> {
  try {
    const res = await fetch(
      `${SUPABASE_URL}/rest/v1/blog_posts?select=slug,title,meta_description,content_html&order=published_at.desc.nullslast&limit=5000`,
      { headers: { apikey: SUPABASE_ANON, Authorization: `Bearer ${SUPABASE_ANON}` } },
    );
    if (!res.ok) {
      console.warn(`[prerender] blog fetch failed: ${res.status}`);
      return [];
    }
    return (await res.json()) as BlogRow[];
  } catch (err) {
    console.warn(`[prerender] blog fetch error: ${(err as Error).message}`);
    return [];
  }
}

const blogPosts = await fetchBlogPosts();

if (blogPosts.length) {
  const blogIndex = routes.find((r) => r.path === "/blog");
  if (blogIndex) {
    blogIndex.links = blogPosts.map((p) => ({ href: `/blog/${p.slug}`, label: p.title }));
  }

  for (const post of blogPosts) {
    const body = stripHtml(post.content_html ?? "");
    const rawDescription =
      post.meta_description?.trim() ||
      (body ? `${body.slice(0, 152).trimEnd()}…` : `${post.title} — MaintenEase blog.`);
    // Keep titles <= 60 and descriptions <= 158 chars so crawlers do not truncate.
    const description =
      rawDescription.length > 158 ? `${rawDescription.slice(0, 157).trimEnd()}…` : rawDescription;
    const suffix = " | MaintenEase";
    const title =
      post.title.length + suffix.length <= 60
        ? `${post.title}${suffix}`
        : post.title.length <= 60
          ? post.title
          : `${post.title.slice(0, 59).trimEnd()}…`;
    routes.push({
      path: `/blog/${post.slug}`,
      title,
      description,
      h1: post.title,
      intro: description,
      sections: chunk(body, 120, 10).map((paragraph, i) => ({
        heading: i === 0 ? "Overview" : "Continued",
        body: paragraph,
      })),
      links: [
        { href: "/blog", label: "All articles" },
        { href: "/learn", label: "Maintenance glossary" },
        { href: "/pricing", label: "Pricing" },
      ],
    });
  }
}

const shell = readFileSync(join(DIST, "index.html"), "utf8");

const LANDING_FAQS = [
  {
    q: "Is there a free trial?",
    a: "Yes — MaintenEase includes a 7-day free trial on every plan. A card is required and you can cancel anytime before day 8 to avoid charges.",
  },
  {
    q: "How much does MaintenEase cost?",
    a: "Plans start at $49/month for Starter (2 seats), $129/month for Pro (4 seats), and $299/month for Business. Annual billing saves 17%.",
  },
  {
    q: "Do I have to import my data manually?",
    a: "No — free onboarding and data import are included so techs stop losing work between texts and whiteboards from day one.",
  },
  {
    q: "How does MaintenEase prevent downtime?",
    a: "AI alerts flag equipment issues before they turn into failures, and drag-and-drop PM calendars keep every asset on its maintenance rhythm.",
  },
  {
    q: "How many seats does each plan include?",
    a: "Starter includes 2 seats, Pro includes 4 seats, and Business includes 4 seats. Additional Business seats cost $15 per month each.",
  },
  {
    q: "What do owners get out of it?",
    a: "Owners stop guessing what is actually done. A clean dashboard tracks work orders, labor, and parts spend so you always know where time and money go.",
  },
] as const;

function headFor(route: Route): string {
  const canonical = route.path === "/" ? `${ORIGIN}/` : `${ORIGIN}${route.path}`;
  const title = esc(route.title);
  const description = esc(route.description);
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" data-rh="true" />`,
    `<link data-rh="true" rel="canonical" href="${canonical}" />`,
    `<meta property="og:type" content="${route.ogType ?? "website"}" />`,
    `<meta property="og:title" content="${title}" />`,
    `<meta property="og:description" content="${description}" />`,
    `<meta property="og:url" content="${canonical}" />`,
    `<meta property="og:image" content="${OG_IMAGE}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:title" content="${title}" />`,
    `<meta name="twitter:description" content="${description}" />`,
    `<meta name="twitter:image" content="${OG_IMAGE}" />`,
    ...[ORGANIZATION_JSON_LD, WEBSITE_JSON_LD, BRAND_JSON_LD].map(
      (block) => `<script type="application/ld+json" data-ld-static="true">${JSON.stringify(block)}</script>`,
    ),
  ];

  if (["/", "/landing", "/pricing"].includes(route.path)) {
    tags.push(`<script type="application/ld+json" data-ld-static="true">${JSON.stringify(SOFTWARE_APPLICATION_JSON_LD)}</script>`);
  }
  if (route.path === "/pricing") {
    tags.push(`<script type="application/ld+json" data-ld-static="true">${JSON.stringify(PRODUCT_JSON_LD)}</script>`);
  }

  for (const block of route.jsonLd ?? []) {
    tags.push(`<script type="application/ld+json">${JSON.stringify(block)}</script>`);
  }

  // /landing is a paid-acquisition surface: crawlers must see robots + org/site/FAQ
  // structured data in the static shell (Helmet alone is invisible without JS).
  if (route.path === "/landing") {
    tags.push(
      `<meta name="robots" content="index,follow,max-image-preview:large" data-rh="true" />`,
    );
    const faq = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      mainEntity: LANDING_FAQS.map((f) => ({
        "@type": "Question",
        name: f.q,
        acceptedAnswer: { "@type": "Answer", text: f.a },
      })),
    };
    for (const block of [faq]) {
      tags.push(
        `<script type="application/ld+json">${JSON.stringify(block)}</script>`,
      );
    }
    // Visible FAQ copy must match FAQPage JSON-LD for rich-result eligibility.
    // bodyFor also mirrors these Q&As below.
  }
  return tags.join("\n    ");
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
  if (route.path === "/landing") {
    parts.push("<h2>Frequently asked questions</h2>");
    for (const f of LANDING_FAQS) {
      parts.push(`<h3>${esc(f.q)}</h3>`);
      parts.push(`<p>${esc(f.a)}</p>`);
    }
  }
  if (route.path === "/maintenance-simplified") {
    parts.push("<h2>Frequently asked questions</h2>");
    for (const [question, answer] of MAINTENANCE_SIMPLIFIED_FAQS) {
      parts.push(`<h3>${esc(question)}</h3>`);
      parts.push(`<p>${esc(answer)}</p>`);
    }
  }
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
  // Visually hidden (still in the DOM and fully crawlable) so real visitors
  // never see a flash of unstyled fallback text before hydration.
  const hidden =
    "position:absolute;width:1px;height:1px;margin:-1px;padding:0;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap;border:0;";
  return `<div data-prerender="static" style="${hidden}">${parts.join("\n      ")}</div>`;
}

function renderRoute(route: Route): string {
  let html = shell;

  // Replace the shell's title / description / canonical with route-specific tags.
  html = html.replace(/<title>[\s\S]*?<\/title>\s*/, "");
  html = html.replace(/<meta name="description"[^>]*>\s*/, "");
  html = html.replace(/<link[^>]*rel="canonical"[^>]*>\s*/, "");
  html = html.replace(/<meta property="og:(?:type|title|description|url)"[^>]*>\s*/g, "");
  html = html.replace(/<meta name="twitter:(?:card|title|description)"[^>]*>\s*/g, "");
  // Replace the source shell's homepage blocks with the shared catalog nodes.
  html = html.replace(
    /<script type="application\/ld\+json" data-ld-home="[^"]*">[\s\S]*?<\/script>\s*/g,
    "",
  );
  html = html.replace("</head>", `  ${headFor(route)}\n  </head>`);

  html = html.replace('<div id="root"></div>', `<div id="root">${bodyFor(route)}</div>`);
  return html;
}

let written = 0;
for (const route of routes) {
  const html = renderRoute(route);
  // Write both `<path>/index.html` and `<path>.html` so clean URLs resolve on
  // any static host (some map /a/b -> a/b/index.html, others -> a/b.html).
  const targets =
    route.path === "/"
      ? [join(DIST, "index.html")]
      : [
          join(DIST, route.path.replace(/^\//, ""), "index.html"),
          join(DIST, `${route.path.replace(/^\//, "")}.html`),
        ];
  for (const outPath of targets) {
    mkdirSync(dirname(outPath), { recursive: true });
    writeFileSync(outPath, html);
    written++;
  }
}

console.log(`[prerender] wrote ${written} static route documents → dist/`);
