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
      "MaintainX is a popular work-order and procedure app billed per user per month. MaintenEase matches the core workflow — work orders, assets, preventive maintenance, inspections, and mobile — and prices it as one flat fee, so adding the whole crew doesn't multiply the bill.",
    rows: makeRows("MaintainX", 21),
    differentiators: [
      { title: "Whole crew, one price", body: "Bring every technician on without per-seat costs — useful once your team grows past a handful of users." },
      { title: "No annual lock-in", body: "Month-to-month billing; cancel or change plans anytime." },
      { title: "Free onboarding", body: "We set up your assets, PMs, and reports with you during a free onboarding instead of leaving you to DIY." },
    ],
    faqs: [pricingFaq("MaintainX", 21), affiliationFaq("MaintainX"), migrationFaq("MaintainX")],
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
    metaTitle: "MaintenEase vs eMaint — Modern Flat-Fee CMMS Alternative (2026)",
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
