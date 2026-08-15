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
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { solutions } from "../src/data/solutions";
import { glossary } from "../src/data/glossary";
import { comparisons, getFaqSchemaEntries } from "../src/data/comparisons";
import { maintenanceTemplates } from "../src/data/maintenanceTemplates";
import { MCP_PAGE } from "../src/data/mcpPage";
import {
  SUPPORT_FAQS,
  SUPPORT_PAGE,
  SUPPORT_REQUEST_CHECKLIST,
  SUPPORT_TOPICS,
} from "../src/data/supportPage";
import {
  FEATURED_DISCOVERY_RESOURCES,
  SOLUTION_RESOURCES,
} from "../src/data/seoResources";
import {
  BRAND_JSON_LD,
  ORGANIZATION_JSON_LD,
  PRODUCT_JSON_LD,
  PRODUCT_PLANS,
  COMMON_PLAN_FACTS,
  SOFTWARE_APPLICATION_JSON_LD,
  WEBSITE_JSON_LD,
  buildItemListJsonLd,
} from "../src/data/productCatalog";
import { computeCmmsCosts, formatUsd } from "../src/lib/cmmsSavings";

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
  canonicalPath?: string;
  title: string;
  description: string;
  h1: string;
  intro: string;
  ogType?: "website" | "article";
  jsonLd?: Record<string, unknown>[];
  indexable?: boolean;
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

const uniqueLinks = (links: Array<{ href: string; label: string }>) =>
  Array.from(new Map(links.map((link) => [link.href, link])).values());

const staticRoutes: Route[] = [
  {
    path: "/",
    title: "MaintenEase — CMMS Software to Prevent Downtime",
    description:
      "CMMS for facility and maintenance teams. Track work orders, assets, inspections, and equipment risk with account plans from $49/month.",
    h1: "CMMS Software for Facility & Maintenance Teams",
    intro:
      "Track work orders, assets, and inspections in one place, and act earlier with predictive maintenance on eligible plans. Account plans start at $49 per month.",
    sections: [
      {
        heading: "One work queue for the maintenance team",
        body: "Create, assign, prioritize, and close corrective and preventive work orders from one shared queue. Technicians can update work from a phone while supervisors keep ownership, due dates, parts, labor, and status visible without chasing separate spreadsheets or text threads.",
      },
      {
        heading: "Preventive maintenance tied to each asset",
        body: "Build recurring maintenance schedules around the equipment that needs the work. Generated work orders, inspection results, manuals, photos, and service history stay connected to the asset so the next technician has useful context before starting.",
      },
      {
        heading: "Prioritize emerging equipment risk",
        body: "Pro and Business plans include predictive maintenance tools that help teams review recorded work history and condition data. Risk indicators support inspection and planning decisions; they do not replace a qualified technician's diagnosis or the safety procedures for the equipment.",
      },
      {
        heading: "Published account pricing",
        body: "Starter costs $49 per month with two included seats, Pro costs $129 per month with four included seats, and Business costs $299 per month with four included seats. Business supports additional seats for $15 per month each.",
      },
    ],
    links: uniqueLinks([
      { href: "/pricing", label: "Pricing" },
      { href: "/features", label: "Features" },
      { href: "/mcp", label: "MCP server for AI clients" },
      { href: "/solutions", label: "Solutions" },
      { href: "/learn", label: "Learn" },
      { href: "/templates", label: "Free maintenance templates" },
      { href: "/compare", label: "Compare CMMS software" },
      { href: "/cmms-cost-calculator", label: "CMMS cost calculator" },
      { href: "/blog", label: "Blog" },
      ...FEATURED_DISCOVERY_RESOURCES.map((resource) => ({
        href: resource.href,
        label: resource.title,
      })),
      ...solutions.map((solution) => ({
        href: `/solutions/${solution.slug}`,
        label: solution.name,
      })),
      ...maintenanceTemplates.map((template) => ({
        href: `/templates/${template.slug}`,
        label: template.title,
      })),
      ...glossary.map((entry) => ({
        href: `/learn/${entry.slug}`,
        label: entry.term,
      })),
      ...comparisons.map((comparison) => ({
        href: `/compare/${comparison.slug}`,
        label: comparison.h1,
      })),
    ]),
  },
  {
    path: "/landing",
    canonicalPath: "/",
    title: "MaintenEase — Stop Downtime Before It Starts",
    description:
      "See how MaintenEase helps technicians manage work orders, preventive maintenance, assets, and costs—so teams prevent downtime and prove what gets done.",
    h1: "Stop downtime before it starts.",
    intro:
      "Techs stop losing work between texts and whiteboards. Owners stop guessing what is actually done.",
    sections: [
      {
        heading: "Work orders technicians can update anywhere",
        body: "Give every request an owner, priority, due date, checklist, and status. Mobile access lets technicians record labor, parts, notes, and completion details at the asset instead of recreating the day from memory.",
      },
      {
        heading: "Recurring maintenance without calendar busywork",
        body: "Set preventive maintenance intervals once and let planned work enter the same queue as corrective requests. Supervisors can see overdue work, upcoming tasks, and asset history without maintaining a second scheduling system.",
      },
      {
        heading: "Clear costs and capacity before signup",
        body: "Every plan publishes its included seats, asset capacity, and monthly work-order capacity. Starter begins at $49 per month, and every plan includes a 7-day trial, free onboarding, and data import.",
      },
    ],
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
    sections: [
      ...PRODUCT_PLANS.map((plan) => ({
        heading: `${plan.name}: $${plan.monthlyPrice} per month`,
        body: `${plan.description} Annual billing is $${plan.annualPrice}. ${plan.featureLabels.join(". ")}.`,
      })),
      {
        heading: "Included with every plan",
        body: COMMON_PLAN_FACTS.join(". ") + ".",
      },
    ],
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
    sections: FEATURE_ITEMS.map(([heading, body]) => ({ heading, body })),
    jsonLd: [buildItemListJsonLd(
      "MaintenEase CMMS features",
      `${ORIGIN}/features`,
      FEATURE_ITEMS.map(([name, description]) => ({ name, url: `${ORIGIN}/features`, description })),
    )],
  },
  {
    path: "/mcp",
    title: MCP_PAGE.metaTitle,
    description: MCP_PAGE.metaDescription,
    h1: MCP_PAGE.h1,
    intro: MCP_PAGE.intro,
    sections: [
      {
        heading: "Production MCP endpoint",
        body: `${MCP_PAGE.endpoint}. ${MCP_PAGE.protocol} transport with ${MCP_PAGE.authorization}.`,
      },
      ...MCP_PAGE.tools.map((tool) => ({
        heading: `${tool.title}: ${tool.name}`,
        body: `${tool.access} access. ${tool.description}`,
      })),
      ...MCP_PAGE.safeguards.map((safeguard) => ({
        heading: safeguard.title,
        body: safeguard.description,
      })),
      ...MCP_PAGE.steps.map((step) => ({ heading: step.title, body: step.description })),
    ],
    links: [
      { href: "/mcp.md", label: "Clean Markdown version" },
      { href: "/.well-known/mcp/server-card.json", label: "MCP server card" },
      { href: "/auth.md", label: "Authentication documentation" },
      ...MCP_PAGE.related.map((item) => ({ href: item.href, label: item.label })),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "WebPage",
        name: MCP_PAGE.metaTitle,
        description: MCP_PAGE.metaDescription,
        url: `${ORIGIN}/mcp`,
        dateModified: MCP_PAGE.updated,
        about: {
          "@type": "SoftwareApplication",
          name: "MaintenEase MCP Server",
          applicationCategory: "BusinessApplication",
          applicationSubCategory: "Model Context Protocol server for CMMS software",
          operatingSystem: "Remote service",
          url: `${ORIGIN}/mcp`,
        },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: MCP_PAGE.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
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
        datePublished: "2026-07-20",
        dateModified: "2026-08-14",
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
      { href: "/learn/deferred-maintenance", label: "Prioritize deferred maintenance" },
      { href: "/templates", label: "Download free maintenance templates" },
    ],
  },
  {
    path: "/solutions",
    title: "CMMS Solutions by Use Case | MaintenEase",
    description:
      "Work order software, preventive maintenance, asset tracking, facility and fleet maintenance — see how MaintenEase fits your use case.",
    h1: "CMMS solutions by use case",
    intro: "Purpose-built solutions for work orders, preventive maintenance, assets, facilities, and fleets.",
    sections: solutions.map((solution) => ({ heading: solution.name, body: solution.intro })),
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
    sections: glossary.map((entry) => ({ heading: entry.term, body: entry.short })),
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
    sections: comparisons.map((comparison) => ({
      heading: `MaintenEase vs ${comparison.competitor}`,
      body: comparison.intro,
    })),
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
    sections: [
      {
        heading: "Compare the same team size",
        body: "Enter the number of people who need access. The calculator multiplies a competitor's published per-user monthly price by that team size, then compares it with the lowest MaintenEase account plan whose included seats can cover the team.",
      },
      {
        heading: "Account for included and additional seats",
        body: "Starter includes two seats and Pro includes four. Business includes four seats and supports additional seats for $15 per month each. Asset and work-order capacity can also determine which plan fits, so review the published limits before choosing.",
      },
      {
        heading: "Treat the result as an estimate",
        body: "The calculation uses public list prices and does not include negotiated contracts, implementation charges, taxes, add-ons, or future pricing changes. Confirm the current quote and required features with each vendor before making a purchasing decision.",
      },
      ...[2, 4, 8, 12].map((teamSize) => {
        const result = computeCmmsCosts(teamSize);
        return {
          heading: `Static example: ${teamSize}-person maintenance team`,
          body: `MaintenEase ${result.mainteneasePlan} is ${formatUsd(result.maintenease)} per month for ${teamSize} people${result.mainteneaseExtraSeats ? `, including ${result.mainteneaseExtraSeats} additional Business seats` : ""}. ${result.vendors.map((vendor) => `${vendor.name} ${vendor.plan} is ${formatUsd(vendor.monthly)} per month at its published $${vendor.perUser}-per-user price`).join("; ")}.`,
        };
      }),
    ],
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
  {
    path: "/support",
    title: SUPPORT_PAGE.title,
    description: SUPPORT_PAGE.description,
    h1: SUPPORT_PAGE.h1,
    intro: SUPPORT_PAGE.intro,
    sections: [
      {
        heading: "Contact MaintenEase support",
        body: `Email ${SUPPORT_PAGE.email} for account, billing, import, and product questions. Response time varies by plan and request complexity.`,
      },
      {
        heading: "What to include in a support request",
        body: SUPPORT_REQUEST_CHECKLIST.join("; "),
      },
      ...SUPPORT_TOPICS.map((topic) => ({
        heading: topic.title,
        body: topic.description,
      })),
      {
        heading: "Security and emergency guidance",
        body: "Never email passwords, access tokens, private keys, or payment-card details. MaintenEase provides software support and does not monitor equipment or dispatch emergency services. Follow your organization’s emergency procedure for an immediate hazard.",
      },
    ],
    links: [
      { href: SUPPORT_PAGE.emailHref, label: `Email ${SUPPORT_PAGE.email}` },
      { href: "/help", label: "Open the signed-in Help Center" },
      { href: "/forgot-password", label: "Reset a forgotten password" },
      ...SUPPORT_TOPICS.map((topic) => ({ href: topic.href, label: topic.cta })),
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: SUPPORT_PAGE.title,
        description: SUPPORT_PAGE.description,
        url: SUPPORT_PAGE.canonicalUrl,
        dateModified: SUPPORT_PAGE.updated,
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: SUPPORT_FAQS.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
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
    indexable: false,
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
    sections: [
      { heading: "1. Who we are", body: "This Privacy Notice is issued by Decent4, trading as MaintenEase. Decent4 is the data controller responsible for personal data processed through the Service. Questions may be sent to info@decent4.com." },
      { heading: "2. Categories of personal data we collect", body: "We process account and profile details, operational records such as assets and work orders, support messages, usage and device telemetry, and payment status. Paddle processes payment-card details as Merchant of Record; MaintenEase does not store full card details." },
      { heading: "3. Purposes and legal basis", body: "We use data to create accounts, operate and secure the Service, prevent abuse, improve the product, provide support, send consented marketing, and meet legal, accounting, and tax obligations. The applicable bases include contract performance, legitimate interests, consent, and legal obligation." },
      { heading: "4. How we share data", body: "Data may be shared with service providers and subprocessors, Paddle for subscriptions and tax handling, professional advisers, and authorities when law requires it or our rights must be protected." },
      { heading: "5. Data retention", body: "We keep data while an account is active and as needed to provide the Service. After closure, data is retained only for legal, accounting, and dispute-resolution needs, then deleted or anonymized." },
      { heading: "6. Your rights", body: "Depending on applicable law, you may request access, correction, deletion, restriction, objection, portability, or withdrawal of consent, and may complain to a supervisory authority. Contact info@decent4.com to exercise these rights." },
      { heading: "7. International transfers", body: "When data moves outside its originating country, we rely on safeguards such as Standard Contractual Clauses or adequacy decisions." },
      { heading: "8. Security", body: "MaintenEase uses measures including encryption in transit, access controls, and audit logging to protect personal data from unauthorized access, alteration, or loss." },
      { heading: "9. Cookies", body: "Strictly necessary cookies operate the Service. Consent is requested before analytics or marketing cookies are used where required, with controls for managing preferences." },
      { heading: "10. Changes to this notice", body: "This notice may change over time. The visible Last updated date reflects the latest revision." },
      { heading: "11. SMS messaging program", body: "When a user opts in, MaintenEase processes the mobile number and consent record to send requested operational messages. Mobile numbers and SMS consent are not sold or shared for third-party marketing. Twilio receives only the information needed to deliver messages. Reply STOP to opt out or HELP for assistance." },
    ],
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
    sections: [
      { heading: "1. Who you are contracting with", body: "These Terms form an agreement between the user and Decent4, trading as MaintenEase. Creating an account or using the Service means accepting these Terms." },
      { heading: "2. Authority and eligibility", body: "A person using the Service for an organization represents that they can bind that organization. Individual users must be of legal age in their jurisdiction." },
      { heading: "3. The Service", body: "MaintenEase is a maintenance management platform for assets, work orders, inspections, checklists, and related operations. Features may be changed, added, or removed over time." },
      { heading: "4. Account and credentials", body: "Users must provide accurate information, protect their login credentials, and take responsibility for activity under their accounts." },
      { heading: "5. Acceptable use", body: "The Service may not be used unlawfully or deceptively, for spam, to infringe others' rights, to distribute malware, to interfere with security or integrity, or to bypass access controls." },
      { heading: "6. Intellectual property", body: "Decent4 retains rights in the Service, software, documentation, designs, and branding. Customers retain uploaded content and grant the limited rights required to host and process it for the Service." },
      { heading: "7. Service availability", body: "MaintenEase works to keep the Service available but does not guarantee uninterrupted or error-free operation. Implied warranties are disclaimed to the fullest extent permitted by law." },
      { heading: "8. Payment, subscriptions, and refunds", body: "Paddle.com is Merchant of Record and handles checkout, billing, tax, cancellation mechanics, and returns under its Buyer Terms. The MaintenEase Refund Policy also applies." },
      { heading: "9. Suspension and termination", body: "Access may be suspended or terminated for material breach, non-payment, security or fraud risk, or serious policy violations. A customer may stop using the Service at any time." },
      { heading: "10. Liability", body: "To the fullest extent allowed by law, aggregate liability is limited to fees paid in the preceding 12 months, and indirect or consequential damages are excluded. Legally non-excludable liability remains unaffected." },
      { heading: "11. Governing law", body: "The laws applicable at Decent4's place of establishment govern these Terms, and disputes go to the competent courts of that jurisdiction." },
      { heading: "12. Changes to these Terms", body: "Terms may be updated. Continued use after an update takes effect constitutes acceptance of the revised Terms." },
      { heading: "13. SMS messaging terms", body: "Opted-in users agree to recurring operational SMS messages. Consent is not a condition of purchase; message and data rates may apply. Reply STOP to cancel or HELP for assistance, or contact info@decent4.com." },
    ],
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
    sections: [
      { heading: "30-day money-back guarantee", body: "Decent4, trading as MaintenEase, offers a 30-day money-back guarantee. A customer who is not satisfied may request a full refund within 30 days of the order date." },
      { heading: "How to request a refund", body: "Refunds are processed by Paddle, the Merchant of Record. Visit paddle.net and look up the order with the checkout email, or email info@decent4.com for help." },
      { heading: "Free trials", body: "Paid plans begin with a 7-day free trial. Cancel before the trial ends to avoid a charge; no refund is needed when no charge was made." },
      { heading: "Subscription renewals", body: "Subscriptions renew automatically. Cancellation stops future charges but does not automatically refund the current billing period. Current-period refund requests must be made within the 30-day window." },
    ],
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
    sections: [
      { heading: "What you will receive", body: "Opted-in users may receive work-order assignments and status updates, inspection and checklist reminders, account and security alerts, and occasional service announcements from MaintenEase." },
      { heading: "Message frequency and charges", body: "Messages recur based on account activity, typically up to about 10 per week. Message and data rates may apply, and carriers are not liable for delayed or undelivered messages." },
      { heading: "Consent and opt-out", body: "Consent is not a condition of purchase. Reply STOP at any time to cancel or HELP for assistance. For support, email info@decent4.com." },
      { heading: "Submitting the opt-in form", body: "The secure form validates an E.164 mobile number, such as +15558675310, and requires explicit consent. If JavaScript is unavailable, contact info@decent4.com for an accessible enrollment option." },
    ],
    links: [
      { href: "/privacy", label: "Privacy notice" },
      { href: "/terms", label: "Terms of service" },
    ],
  },
];

const solutionRoutes: Route[] = solutions.map((s) => {
  const resources = SOLUTION_RESOURCES[s.slug] ?? [];
  return {
    path: `/solutions/${s.slug}`,
    title: s.metaTitle,
    description: s.metaDescription,
    h1: s.h1,
    intro: s.intro,
    sections: [
      ...s.benefits.map((b) => ({ heading: b.title, body: b.body })),
      ...s.features.map((f) => ({ heading: f.title, body: f.body })),
      ...resources.map((resource) => ({ heading: resource.title, body: resource.description })),
      ...s.faqs.map((f) => ({ heading: f.q, body: f.a })),
    ],
    links: [
      { href: "/solutions", label: "All solutions" },
      { href: "/pricing", label: "Pricing" },
      ...resources.map((resource) => ({ href: resource.href, label: resource.title })),
    ],
  };
});

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
      ...(g.internalLinks ?? []).map((link) => ({ href: link.href, label: link.label })),
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
    ...(c.pricingTable ? [{ heading: c.pricingTable.heading, body: c.pricingTable.summary }] : []),
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

const templateIndexRoute: Route = {
  path: "/templates",
  title: "Free Maintenance Templates & Checklists | MaintenEase",
  description: "Download free maintenance log, preventive maintenance checklist, and work order templates for Excel and Google Sheets.",
  h1: "Free maintenance templates that stay useful",
  intro: "Clean, practical CSV templates for the maintenance work your team does every day.",
  sections: maintenanceTemplates.map((template) => ({ heading: template.title, body: template.intro })),
  links: maintenanceTemplates.map((template) => ({ href: `/templates/${template.slug}`, label: template.title })),
  jsonLd: [buildItemListJsonLd(
    "Free maintenance templates",
    `${ORIGIN}/templates`,
    maintenanceTemplates.map((template) => ({
      name: template.title,
      url: `${ORIGIN}/templates/${template.slug}`,
      description: template.metaDescription,
    })),
  )],
};

const templateRoutes: Route[] = maintenanceTemplates.map((template) => {
  const url = `${ORIGIN}/templates/${template.slug}`;
  return {
    path: `/templates/${template.slug}`,
    title: template.metaTitle,
    description: template.metaDescription,
    h1: template.h1,
    intro: template.intro,
    ogType: "article",
    sections: [
      ...template.columns.map((column) => ({ heading: column.name, body: column.purpose })),
      ...template.steps.map((step) => ({ heading: step.title, body: step.body })),
      ...template.faqs.map((faq) => ({ heading: faq.q, body: faq.a })),
    ],
    links: [
      { href: "/templates", label: "All maintenance templates" },
      { href: template.downloadPath, label: `Download ${template.title} as CSV` },
      template.relatedLearn,
      template.relatedSolution,
    ],
    jsonLd: [
      {
        "@context": "https://schema.org",
        "@type": "DigitalDocument",
        name: template.title,
        description: template.metaDescription,
        url,
        encodingFormat: "text/csv",
        isAccessibleForFree: true,
        datePublished: template.published,
        dateModified: template.updated,
        author: { "@type": "Organization", name: "MaintenEase" },
      },
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        mainEntity: template.faqs.map((faq) => ({
          "@type": "Question",
          name: faq.q,
          acceptedAnswer: { "@type": "Answer", text: faq.a },
        })),
      },
    ],
  };
});

const routes: Route[] = [
  ...staticRoutes,
  ...solutionRoutes,
  ...learnRoutes,
  ...compareRoutes,
  templateIndexRoute,
  ...templateRoutes,
];

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
  const canonicalPath = route.canonicalPath ?? route.path;
  const canonical = canonicalPath === "/" ? `${ORIGIN}/` : `${ORIGIN}${canonicalPath}`;
  const title = esc(route.title);
  const description = esc(route.description);
  const tags = [
    `<title>${title}</title>`,
    `<meta name="description" content="${description}" data-rh="true" />`,
    `<meta name="robots" content="${route.indexable === false ? "noindex,nofollow" : "index,follow,max-image-preview:large"}" data-rh="true" />`,
    `<link data-rh="true" rel="canonical" href="${canonical}" />`,
    route.indexable === false
      ? ""
      : `<link rel="alternate" type="text/markdown" href="${ORIGIN}${route.path === "/" ? "/index.md" : `${route.path}.md`}" />`,
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

  // /landing is a paid-acquisition surface: crawlers must see org/site/FAQ
  // structured data in the static shell (Helmet alone is invisible without JS).
  if (route.path === "/landing") {
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
    ...(route.sections ?? []).flatMap((s) => [
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
  if (route.path === "/mcp") {
    parts.push("<h2>MCP server questions</h2>");
    for (const faq of MCP_PAGE.faqs) {
      parts.push(`<h3>${esc(faq.q)}</h3>`);
      parts.push(`<p>${esc(faq.a)}</p>`);
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
  // A semantic no-JS fallback avoids shipping crawler-only hidden content.
  // JavaScript visitors never render <noscript>; React replaces #root normally.
  return `<noscript data-prerender="static"><main style="max-width:72rem;margin:0 auto;padding:2rem 1rem;font:16px/1.65 system-ui,sans-serif;color:#172033">${parts.join("\n      ")}</main></noscript>`;
}

function markdownFor(route: Route): string {
  const canonicalPath = route.canonicalPath ?? route.path;
  const canonical = canonicalPath === "/" ? `${ORIGIN}/` : `${ORIGIN}${canonicalPath}`;
  const markdownPath = route.path === "/" ? "/index.md" : `${route.path}.md`;
  const lines = [
    `# ${route.h1}`,
    "",
    `> ${route.intro}`,
    "",
    `Canonical HTML: ${canonical}`,
    `Markdown URL: ${ORIGIN}${markdownPath}`,
  ];

  for (const section of route.sections ?? []) {
    lines.push("", `## ${section.heading}`, "", section.body);
  }

  const faqs = route.path === "/landing"
    ? LANDING_FAQS.map((faq) => [faq.q, faq.a] as const)
    : route.path === "/maintenance-simplified"
      ? MAINTENANCE_SIMPLIFIED_FAQS
      : route.path === "/mcp"
        ? MCP_PAGE.faqs.map((faq) => [faq.q, faq.a] as const)
        : route.path === "/support"
          ? SUPPORT_FAQS.map((faq) => [faq.q, faq.a] as const)
          : [];
  if (faqs.length) {
    lines.push("", "## Frequently asked questions");
    for (const [question, answer] of faqs) {
      lines.push("", `### ${question}`, "", answer);
    }
  }

  if (route.links?.length) {
    lines.push("", "## Related resources", "");
    for (const link of uniqueLinks(route.links)) {
      const href = /^(?:https?:|mailto:)/.test(link.href) ? link.href : `${ORIGIN}${link.href}`;
      lines.push(`- [${link.label}](${href})`);
    }
  }

  return `${lines.join("\n").trim()}\n`;
}

function renderRoute(route: Route): string {
  let html = shell;

  // Replace the shell's title / description / canonical with route-specific tags.
  html = html.replace(/<title>[\s\S]*?<\/title>\s*/, "");
  html = html.replace(/<meta name="description"[^>]*>\s*/, "");
  html = html.replace(/<meta name="robots"[^>]*>\s*/, "");
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

function renderAppShell(): string {
  let html = shell;
  html = html.replace(/<title>[\s\S]*?<\/title>\s*/, "");
  html = html.replace(/<meta name="description"[^>]*>\s*/, "");
  html = html.replace(/<meta name="robots"[^>]*>\s*/, "");
  html = html.replace(/<link[^>]*rel="canonical"[^>]*>\s*/, "");
  html = html.replace(
    /<script type="application\/ld\+json" data-ld-home="[^"]*">[\s\S]*?<\/script>\s*/g,
    "",
  );
  const head = [
    "<title>MaintenEase workspace</title>",
    '<meta name="description" content="Secure MaintenEase application workspace." />',
    '<meta name="robots" content="noindex,nofollow" />',
  ].join("\n    ");
  return html.replace("</head>", `  ${head}\n  </head>`);
}

const appShellPath = join(DIST, "app-shell");
writeFileSync(appShellPath, renderAppShell());

let written = 0;
let markdownWritten = 0;
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

  // Published blog posts already have a dynamic, database-backed Markdown
  // function. All other public pages get a build-time representation. Preserve
  // richer data-generated Markdown files that were copied from public/.
  if (route.indexable !== false && !route.path.startsWith("/blog/")) {
    const markdownPath = route.path === "/"
      ? join(DIST, "index.md")
      : join(DIST, `${route.path.replace(/^\//, "")}.md`);
    if (!existsSync(markdownPath)) {
      mkdirSync(dirname(markdownPath), { recursive: true });
      writeFileSync(markdownPath, markdownFor(route));
      markdownWritten++;
    }
  }
}

console.log(`[prerender] wrote ${written} HTML documents and ${markdownWritten} missing Markdown alternatives → dist/`);
