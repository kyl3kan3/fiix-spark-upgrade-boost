/**
 * Competitor comparison pages (/compare/:slug).
 *
 * These exist to capture high-intent "MaintenEase vs <competitor>" and
 * "<competitor> alternative" searches and to earn relevant links. The honest,
 * verifiable angle is pricing model: every listed competitor bills per user,
 * MaintenEase charges one flat fee. Per-user prices mirror the figures already
 * used (with the same disclaimer) in src/components/FlatFeeAdvantage.tsx and
 * reflect publicly listed entry/standard tiers as of 2026 — illustrative, not a
 * live quote. Feature rows we can't verify per-plan are marked "Varies" rather
 * than asserted as missing, so the comparison stays fair and defensible.
 */

export const MAINTENEASE_PRO = 129; // flat $/mo, matches FlatFeeAdvantage + Pricing
export const TEAM_SIZE = 8; // illustrative crew used for the cost comparison

export type CompareValue = string | boolean;
export type CompareRow = { feature: string; ours: CompareValue; theirs: CompareValue; highlight?: boolean };

/** Optional long-form blocks, used by comparisons that need real depth. */
export type CompareSection = { heading: string; paragraphs: string[] };
export type CompetitorTier = { name: string; price: string; notes: string };
export type BestFit = { ours: string[]; theirs: string[] };
export type MigrationStep = { title: string; body: string };

export type Comparison = {
  slug: string;
  competitor: string;
  competitorPlan: string;
  competitorPricePerUser: number;
  metaTitle: string;
  metaDescription: string;
  h1: string;
  tagline: string;
  intro: string;
  rows: CompareRow[];
  differentiators: { title: string; body: string }[];
  faqs: { q: string; a: string }[];
  /** Long-form comparison narrative (optional, rendered when present). */
  sections?: CompareSection[];
  /** Publicly listed competitor plan ladder (optional). */
  competitorTiers?: CompetitorTier[];
  /** Honest "pick them / pick us" guidance (optional). */
  bestFit?: BestFit;
  /** Concrete switching plan (optional). */
  migrationSteps?: MigrationStep[];
};

/** Standard, honest comparison rows for a per-seat competitor. */
const makeRows = (competitor: string, pricePerUser: number): CompareRow[] => [
  { feature: "Pricing model", ours: "One flat monthly fee", theirs: "Per user / month", highlight: true },
  {
    feature: `Cost for a team of ${TEAM_SIZE}`,
    ours: `$${MAINTENEASE_PRO}/mo`,
    theirs: `$${pricePerUser * TEAM_SIZE}/mo`,
    highlight: true,
  },
  { feature: "Add more technicians", ours: "Included — no per-seat charge", theirs: "Charged per seat", highlight: true },
  { feature: "Billing commitment", ours: "Month-to-month", theirs: "Often annual" },
  { feature: "Work order management", ours: true, theirs: true },
  { feature: "Asset management & history", ours: true, theirs: true },
  { feature: "Preventive maintenance scheduling", ours: true, theirs: true },
  { feature: "Mobile app", ours: true, theirs: true },
  { feature: "AI predictive maintenance", ours: true, theirs: "Higher tier / add-on" },
  { feature: "Energy / power usage tracking", ours: true, theirs: "Varies" },
  { feature: "Public request portal (no login)", ours: true, theirs: "Varies" },
  { feature: "Free onboarding & data import", ours: true, theirs: "Varies / paid" },
];

const pricingFaq = (competitor: string, pricePerUser: number) => ({
  q: `How much does MaintenEase save vs ${competitor}?`,
  a: `${competitor}'s listed plan is around $${pricePerUser} per user per month, so a team of ${TEAM_SIZE} runs about $${pricePerUser * TEAM_SIZE}/mo. MaintenEase Pro is a flat $${MAINTENEASE_PRO}/mo for the whole team — the gap widens with every technician you add. Figures are based on publicly listed pricing as of 2026; check each vendor for current rates.`,
});

const affiliationFaq = (competitor: string) => ({
  q: `Is MaintenEase affiliated with ${competitor}?`,
  a: `No. This page is an independent comparison based on publicly available pricing and feature information as of 2026. ${competitor} is a trademark of its respective owner. Always verify current details on the vendor's own site.`,
});

const migrationFaq = (competitor: string) => ({
  q: `Can I migrate from ${competitor} to MaintenEase?`,
  a: `Yes. Export your assets and work orders (CSV/Excel) and our team imports them for free during onboarding — most teams are live within a few days.`,
});

export const comparisons: Comparison[] = [
  {
    slug: "maintenease-vs-upkeep",
    competitor: "UpKeep",
    competitorPlan: "Starter",
    competitorPricePerUser: 45,
    metaTitle: "MaintenEase vs UpKeep — Flat-Fee CMMS Comparison (2026)",
    metaDescription:
      "MaintenEase vs UpKeep: same core CMMS features, but one flat monthly fee instead of per-technician pricing. See the side-by-side comparison.",
    h1: "MaintenEase vs UpKeep",
    tagline: "The same core CMMS — without paying by the technician.",
    intro:
      "UpKeep is a well-known mobile-first CMMS, priced per user per month. MaintenEase covers the same essentials — work orders, assets, preventive maintenance, inspections, and mobile access — but charges one flat fee for your whole crew. For a growing team, that's the difference between a bill that climbs with every hire and one that doesn't.",
    rows: makeRows("UpKeep", 45),
    differentiators: [
      { title: "One flat price, not per seat", body: "Add the whole maintenance team without your bill climbing. UpKeep's per-user pricing means every new technician adds to the monthly cost." },
      { title: "Month-to-month", body: "MaintenEase is month-to-month — no annual contract required to get the listed price." },
      { title: "Free, hands-on migration", body: "We import your assets and open work orders for free so switching from UpKeep doesn't mean re-keying your data." },
    ],
    faqs: [pricingFaq("UpKeep", 45), affiliationFaq("UpKeep"), migrationFaq("UpKeep")],
  },
  {
    slug: "maintenease-vs-fiix",
    competitor: "Fiix",
    competitorPlan: "Basic",
    competitorPricePerUser: 45,
    metaTitle: "MaintenEase vs Fiix — Flat-Fee CMMS Comparison (2026)",
    metaDescription:
      "MaintenEase vs Fiix: a flat-fee alternative to Fiix's per-user CMMS pricing. Compare work orders, assets, PMs, and total cost side by side.",
    h1: "MaintenEase vs Fiix",
    tagline: "A flat-fee alternative to per-user CMMS pricing.",
    intro:
      "Fiix is an established CMMS with deep asset features, billed per user per month. MaintenEase delivers the core maintenance workflow — work orders, asset history, preventive schedules, predictive maintenance, and reporting — for one flat monthly fee, so the whole crew can be on the system without watching the seat count.",
    rows: makeRows("Fiix", 45),
    differentiators: [
      { title: "Predictable flat billing", body: "One monthly price covers the whole team — no recalculating cost every time you add or remove a technician." },
      { title: "Fast to live", body: "MaintenEase is built to be running the same week, with free data import rather than a long implementation." },
      { title: "Modern, mobile-first", body: "Technicians close work from their phone; managers see status in real time without a heavyweight rollout." },
    ],
    faqs: [pricingFaq("Fiix", 45), affiliationFaq("Fiix"), migrationFaq("Fiix")],
  },
  {
    slug: "maintenease-vs-maintainx",
    competitor: "MaintainX",
    competitorPlan: "Essential",
    competitorPricePerUser: 21,
    metaTitle: "MaintenEase vs MaintainX — CMMS Pricing Comparison (2026)",
    metaDescription:
      "MaintenEase vs MaintainX: compare features and total cost. MaintenEase charges one flat fee instead of per-user pricing as your team grows.",
    h1: "MaintenEase vs MaintainX",
    tagline: "Flat-fee pricing that doesn't scale with headcount.",
    intro:
      "MaintainX is a popular work-order and procedure app billed per user per month, with a free tier for very small teams and paid tiers that unlock reporting, PMs, and analytics. MaintenEase covers the same everyday workflow — work orders, assets and history, preventive maintenance, inspections, mobile access, and reporting — but charges one flat monthly fee for the whole company. This page lays out where the two products genuinely overlap, where MaintainX is the better fit, and exactly where the flat-fee model starts to win on cost.",
    rows: makeRows("MaintainX", 21),
    sections: [
      {
        heading: "The short answer",
        paragraphs: [
          "Both products are cloud CMMS tools built around mobile work orders: a request comes in, it becomes a work order, a technician completes it on their phone, and the asset keeps a service history. If you are comparing them, you are almost certainly not choosing between \"can it do work orders\" — both can.",
          "The real decision is pricing model and breadth. MaintainX bills per user per month, with capability gated by tier, and is strongest when your work is procedure-driven — repeatable checklists, standard operating procedures, and safety forms that many hands run identically. MaintenEase bills one flat monthly fee for unlimited work orders and assets, and includes AI predictive maintenance, energy/power usage tracking, a no-login public request portal, and free onboarding on the plan you buy rather than behind an upgrade.",
          "Rule of thumb from our own pricing page: MaintenEase Pro is $129/mo flat. Against a publicly listed ~$21/user/mo tier, the two are roughly even at about six paid seats, and MaintenEase is the cheaper option above that. Below six seats, honest answer: per-seat can be cheaper, and MaintainX's free tier can be cheaper still.",
        ],
      },
      {
        heading: "Cost as your crew grows",
        paragraphs: [
          "Per-seat pricing means your software bill is a function of headcount. At a publicly listed ~$21/user/mo, five paid users is about $105/mo, eight is about $168/mo, fifteen is about $315/mo, and twenty-five is about $525/mo. MaintenEase Pro stays at $129/mo across all of those, and Business is $299/mo when you need the larger plan's limits.",
          "That difference compounds in two places people forget to model. First, seasonal or part-time technicians: with per-seat billing, a summer helper is a line item, so teams share logins or leave people off the system — and the work history gets worse. Second, the people who only need to look: supervisors, office staff, and contractors who check status once a week still consume a seat on most per-seat plans.",
          "Use the MaintenEase cost calculator to run your own headcount rather than trusting a table on a vendor's page — it shows the crossover point where per-seat becomes more expensive, including the range where per-seat wins.",
        ],
      },
      {
        heading: "Where MaintainX is genuinely the better choice",
        paragraphs: [
          "A comparison page that says the competitor is worse at everything is not useful, so here is the honest version. Pick MaintainX if your team is one to four paid users — per-seat math simply favours you, and their free tier covers a very small operation. Pick MaintainX if procedure and SOP libraries are the core of your work: it is built around standardised, repeatable digital procedures and that is a real strength.",
          "MaintainX is also the safer pick if you need a large marketplace of prebuilt integrations, multi-language field crews, or the kind of enterprise procurement, security review, and vendor-scale reassurance that a bigger, well-funded company can provide. MaintenEase is a smaller product; if long vendor questionnaires and enterprise IoT sensor programmes are decision criteria, weigh that seriously.",
        ],
      },
      {
        heading: "Where MaintenEase pulls ahead",
        paragraphs: [
          "Cost predictability is the headline: one flat fee, month-to-month, so you can put every technician, supervisor, and office user on the system without a budget conversation. Nothing in our pricing changes when you hire.",
          "Beyond price, MaintenEase includes things per-seat CMMS products often push to a higher tier or an add-on: AI predictive maintenance scoring on your asset history, energy and power usage tracking alongside maintenance cost, digital inspections and checklists, a public request portal that tenants or staff use without an account, an AI assistant over your own data, and an MCP/agent API so tools like ChatGPT or Claude can read work orders and create them with your permission.",
          "Onboarding is the other practical difference. We import your assets, open work orders, and PM schedules for free and set up your first reports with you, rather than handing you a CSV template and a help centre article.",
        ],
      },
      {
        heading: "What comparison pages usually leave out",
        paragraphs: [
          "Requester and view-only seats. Ask any vendor, including us, exactly who counts as a billable user. MaintainX publicly advertises unlimited free requesters; that matters, and it is the kind of detail that changes the real bill. On MaintenEase there is no seat count at all, and requests can also arrive through a public link with no login.",
          "Annual versus monthly. Advertised per-user prices are usually the annual-commitment rate; paying monthly typically costs more. MaintenEase's listed prices are month-to-month, so compare like with like before you conclude anything about savings.",
          "Tier gating. With tiered per-seat products, the price you compare is often not the price you end up on, because reporting, PM automation, or analytics live a tier up. Write down the three features you actually need, then check which tier contains all three.",
          "Exit cost. Ask both vendors how you get your data out — asset lists, work order history with attachments, and PM definitions. MaintenEase exports to CSV/Excel on demand; confirm the equivalent before you commit anywhere.",
        ],
      },
    ],
    competitorTiers: [
      { name: "Basic", price: "Free", notes: "Publicly listed free tier for very small teams, with usage limits." },
      { name: "Essential", price: "~$21 / user / mo", notes: "Entry paid tier used for the cost comparison on this page." },
      { name: "Premium", price: "~$49 / user / mo", notes: "Adds higher-tier reporting and analytics capability." },
      { name: "Enterprise", price: "Custom quote", notes: "Negotiated pricing and enterprise controls." },
    ],
    bestFit: {
      ours: [
        "You have roughly six or more people who need access, including supervisors and office staff.",
        "You want a bill that never changes when you hire, and month-to-month billing with no annual commitment.",
        "You want predictive maintenance, energy tracking, and a public request portal included rather than gated.",
        "You'd rather have someone import your assets and PMs for you than DIY the setup.",
      ],
      theirs: [
        "You are one to four paid users, where per-seat pricing is genuinely cheaper.",
        "Standardised procedures and SOP libraries are the centre of how your team works.",
        "You need a large prebuilt integration marketplace or multi-language field crews.",
        "Enterprise procurement, security review depth, and vendor scale are hard requirements.",
      ],
    },
    migrationSteps: [
      { title: "1. Export from MaintainX", body: "Pull your assets, locations, open work orders, and PM schedules to CSV/Excel. Grab attachments for anything you need a paper trail on." },
      { title: "2. Send it to us", body: "We map your columns to MaintenEase fields — asset, location, criticality, PM frequency — and flag anything ambiguous before importing." },
      { title: "3. Run both for a week", body: "Keep MaintainX read-only while your crew closes real work in MaintenEase. It's the only reliable way to know the workflow fits your team." },
      { title: "4. Cut over and cancel", body: "Once history and PMs look right and technicians are comfortable, switch requests to MaintenEase and cancel the per-seat subscription." },
    ],
    differentiators: [
      { title: "Whole crew, one price", body: "Bring every technician, supervisor, and office user on without per-seat costs. At a listed ~$21/user/mo the models are roughly even around six seats, and flat fee is cheaper above that." },
      { title: "No annual lock-in", body: "MaintenEase's listed prices are month-to-month — cancel or change plans anytime, with no annual commitment needed to get the advertised rate." },
      { title: "Included, not gated", body: "AI predictive maintenance, energy/power usage tracking, digital inspections, and a no-login public request portal come with the plan rather than a higher tier or add-on." },
      { title: "Free, hands-on onboarding", body: "We import your assets, open work orders, and PM schedules and build your first reports with you — most teams are running within a few days." },
    ],
    faqs: [
      pricingFaq("MaintainX", 21),
      {
        q: "At what team size does MaintenEase become cheaper than MaintainX?",
        a: "Against a publicly listed ~$21/user/mo tier, six paid users is about $126/mo versus MaintenEase Pro at a flat $129/mo — effectively the break-even point. Below that, per-seat is cheaper and we'll say so; above it, the flat fee wins and the gap grows with every hire. Run your own numbers in the CMMS cost calculator.",
      },
      {
        q: "Is MaintenEase a good MaintainX alternative for a small team?",
        a: "If you have fewer than about five paid users, MaintainX's per-seat pricing (or its free tier) may cost less, and that's a fair reason to stay. MaintenEase Starter is $49/mo flat, so it's competitive for small teams that want unlimited users and no seat management, plus predictive maintenance and a public request portal included.",
      },
      {
        q: "What does MaintenEase include that per-user CMMS plans often charge extra for?",
        a: "AI predictive maintenance scoring, energy and power usage tracking, digital inspections and checklists, a public request portal that works without a login, an AI assistant over your own maintenance data, an agent/MCP API, and free data import and onboarding.",
      },
      {
        q: "Does MaintenEase have a mobile app for technicians?",
        a: "Yes. MaintenEase is mobile-first — technicians view assigned work, add notes and photos, complete checklists, and close work orders from their phone, and the asset keeps the full history automatically.",
      },
      {
        q: "Do requesters or view-only users cost extra on MaintenEase?",
        a: "No. There is no seat count on MaintenEase, so supervisors, office staff, and part-time technicians cost nothing extra. Requests can also come through a public portal link with no account at all.",
      },
      migrationFaq("MaintainX"),
      affiliationFaq("MaintainX"),
    ],
  },
  {
    slug: "maintenease-vs-limble",
    competitor: "Limble",
    competitorPlan: "Standard",
    competitorPricePerUser: 28,
    metaTitle: "MaintenEase vs Limble — Flat-Fee CMMS Comparison (2026)",
    metaDescription:
      "MaintenEase vs Limble CMMS: a flat-fee alternative to per-user pricing. Compare work orders, assets, preventive maintenance, and total cost.",
    h1: "MaintenEase vs Limble",
    tagline: "The flat-fee way to run preventive maintenance.",
    intro:
      "Limble is a modern CMMS billed per user per month. MaintenEase covers the same day-to-day — work orders, asset management, preventive and predictive maintenance, inspections, and reporting — for one flat monthly fee, so your cost stays the same whether you have four technicians or fourteen.",
    rows: makeRows("Limble", 28),
    differentiators: [
      { title: "Cost that doesn't climb", body: "A flat monthly fee means a new hire never increases your software bill." },
      { title: "Everything in one place", body: "Work orders, assets, PMs, predictive maintenance, and energy tracking under one login." },
      { title: "Switch for free", body: "Free data import and onboarding make moving from Limble low-effort." },
    ],
    faqs: [pricingFaq("Limble", 28), affiliationFaq("Limble"), migrationFaq("Limble")],
  },
  {
    slug: "maintenease-vs-emaint",
    competitor: "eMaint",
    competitorPlan: "Team",
    competitorPricePerUser: 69,
    metaTitle: "MaintenEase vs eMaint — Flat-Fee CMMS Alternative",
    metaDescription:
      "MaintenEase vs eMaint: a modern, mobile-first alternative to legacy enterprise CMMS. Flat monthly fee instead of per-user seats. Compare features and cost.",
    h1: "MaintenEase vs eMaint",
    tagline: "A modern, mobile-first alternative to legacy enterprise CMMS.",
    intro:
      "eMaint (a Fluke company) is a long-established enterprise CMMS billed per user per month, with a heavier interface aimed at large industrial deployments. MaintenEase delivers the same core maintenance workflow — work orders, assets, preventive maintenance, inspections, and reporting — in a mobile-first UI, for one flat monthly fee. If eMaint feels like more system (and more cost) than your crew needs, MaintenEase is the leaner alternative.",
    rows: makeRows("eMaint", 69),
    differentiators: [
      { title: "Mobile-first, not desktop-first", body: "Technicians close work from their phone in a couple of taps — no training on a legacy enterprise console." },
      { title: "Flat fee vs per-seat enterprise pricing", body: "eMaint's per-user pricing adds up fast for a growing crew. MaintenEase is one flat monthly price for the whole team." },
      { title: "Live in days, not months", body: "Free data import and guided onboarding replace long enterprise implementations." },
    ],
    faqs: [pricingFaq("eMaint", 69), affiliationFaq("eMaint"), migrationFaq("eMaint")],
  },
];

export const getComparison = (slug: string) => comparisons.find((c) => c.slug === slug);
