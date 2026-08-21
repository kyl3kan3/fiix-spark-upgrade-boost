/**
 * Competitor comparison pages (/compare/:slug).
 *
 * These exist to capture high-intent "MaintenEase vs <competitor>" and
 * "<competitor> alternative" searches and to earn relevant links. The honest,
 * verifiable angle is pricing model: MaintenEase publishes account plans with
 * included seats, while rivals either publish per-user pricing or require an
 * estimate. Public prices feed the calculator; quote-only vendors are excluded
 * from cost math. Feature rows we can't verify per plan are marked "Varies"
 * rather than asserted as missing, so the comparison stays fair and defensible.
 */
import {
  PLAN_BY_TIER,
  PRODUCT_LAST_MODIFIED,
  getMaintenEaseTeamPrice,
} from "@/data/productCatalog";

export const MAINTENEASE_PRO = PLAN_BY_TIER.pro.monthlyPrice;
export const TEAM_SIZE = 8; // illustrative crew used for the cost comparison
export const MAINTENEASE_TEAM_PRICE = getMaintenEaseTeamPrice(TEAM_SIZE);

export type CompareValue = string | boolean;
export type CompareRow = { feature: string; ours: CompareValue; theirs: CompareValue; highlight?: boolean };

/** Optional long-form blocks, used by comparisons that need real depth. */
export type CompareSection = { heading: string; paragraphs: string[] };
export type CompetitorTier = { name: string; price: string; notes: string };
export type PricingTableRow = { plan: string; competitorPrice: string; mainteneasePrice: string };
export type PricingTable = {
  heading: string;
  summary: string;
  sourceLabel: string;
  sourceUrl: string;
  verifiedOn: string;
  rows: PricingTableRow[];
};
export type BestFit = { ours: string[]; theirs: string[] };
export type MigrationStep = { title: string; body: string };
export type ComparisonSource = { label: string; url: string };

/**
 * Content freshness dates (`datePublished` / `dateModified`).
 *
 * PROCESS — update `dateModified` ONLY when the substantive content of a
 * comparison actually changes (pricing figures, feature rows, narrative
 * sections, FAQs, best-fit or migration guidance). Do NOT bump it for typo
 * fixes, styling, refactors or unrelated site-wide changes: spurious
 * "freshness" signals are worse than an honest older date.
 * Format: ISO `YYYY-MM-DD`. The visible "Last updated" line on
 * /compare/:slug and the WebPage JSON-LD both read from these fields, so they
 * can never drift apart.
 */
export type Comparison = {
  slug: string;
  competitor: string;
  competitorPlan: string;
  /** Public per-user list price used in calculators, or null when the vendor requires a quote. */
  competitorPricePerUser: number | null;
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
  /** Snippet-friendly current pricing table with an official vendor source. */
  pricingTable?: PricingTable;
  /** Honest "pick them / pick us" guidance (optional). */
  bestFit?: BestFit;
  /** Concrete switching plan (optional). */
  migrationSteps?: MigrationStep[];
  /** Primary vendor documentation used for time-sensitive claims. */
  sources?: ComparisonSource[];
  /** ISO date (YYYY-MM-DD) this comparison was first published. */
  datePublished?: string;
  /** ISO date (YYYY-MM-DD) of the last substantive content change. */
  dateModified?: string;
};

/** Standard, honest comparison rows for a per-seat competitor. */
const makeRows = (competitor: string, pricePerUser: number | null): CompareRow[] => [
  {
    feature: "Pricing model",
    ours: "Account plan with included seats",
    theirs: pricePerUser === null ? "Custom estimate" : "Per user / month",
    highlight: true,
  },
  {
    feature: `Cost for a team of ${TEAM_SIZE}`,
    ours: `$${MAINTENEASE_TEAM_PRICE.monthlyPrice}/mo (${MAINTENEASE_TEAM_PRICE.plan.name})`,
    theirs: pricePerUser === null ? "Quote required" : `$${pricePerUser * TEAM_SIZE}/mo`,
    highlight: true,
  },
  { feature: "Add more technicians", ours: "Business: $15/extra seat after 4", theirs: pricePerUser === null ? "Confirm in quote" : "Published per-seat price", highlight: true },
  { feature: "Billing commitment", ours: "Month-to-month", theirs: "Check current vendor terms" },
  { feature: "Work order management", ours: true, theirs: true },
  { feature: "Asset management & history", ours: true, theirs: true },
  { feature: "Preventive maintenance scheduling", ours: true, theirs: true },
  { feature: "Mobile app", ours: true, theirs: true },
  { feature: "AI predictive maintenance", ours: true, theirs: "Verify required tier" },
  { feature: "Energy / power usage tracking", ours: true, theirs: "Verify with vendor" },
  { feature: "Public request portal (no login)", ours: true, theirs: "Verify with vendor" },
  { feature: "Free onboarding & data import", ours: true, theirs: "Verify scope and fees" },
];

const pricingFaq = (competitor: string, pricePerUser: number) => ({
  q: `How much does MaintenEase save vs ${competitor}?`,
  a: `${competitor}'s listed plan is around $${pricePerUser} per user per month, so a team of ${TEAM_SIZE} runs about $${pricePerUser * TEAM_SIZE}/mo. The lowest published MaintenEase plan covering ${TEAM_SIZE} seats is ${MAINTENEASE_TEAM_PRICE.plan.name} at $${MAINTENEASE_TEAM_PRICE.monthlyPrice}/mo, including ${MAINTENEASE_TEAM_PRICE.extraSeats} extra seats. Asset or work-order volume can require a higher plan. Figures are based on publicly listed pricing as of 2026; check each vendor for current rates.`,
});

const affiliationFaq = (competitor: string) => ({
  q: `Is MaintenEase affiliated with ${competitor}?`,
  a: `No. This page is an independent comparison based on publicly available pricing and feature information as of 2026. ${competitor} is a trademark of its respective owner. Always verify current details on the vendor's own site.`,
});

const migrationFaq = (competitor: string) => ({
  q: `Can I migrate from ${competitor} to MaintenEase?`,
  a: `Yes. Export your assets and work orders (CSV/Excel) and our team imports them for free during onboarding. The rollout timing depends on the size and condition of the data you provide.`,
});

export const comparisons: Comparison[] = [
  {
    slug: "maintenease-vs-upkeep",
    datePublished: "2026-08-13",
    dateModified: "2026-08-16",
    competitor: "UpKeep",
    competitorPlan: "Premium",
    competitorPricePerUser: 55,
    metaTitle: "UpKeep Pricing 2026: Plans, Limits & MaintenEase Cost",
    metaDescription:
      "UpKeep pricing explained tier by tier, compared with MaintenEase account plans and included seats. See real monthly cost for a team of 8 before you switch.",
    h1: "MaintenEase vs UpKeep",
    tagline: "The same core CMMS — without paying by the technician.",
    intro:
      "UpKeep is a well-known mobile-first CMMS priced per user per month. MaintenEase covers the same essentials — work orders, assets, preventive maintenance, inspections, and mobile access — through account plans with included seats. Business includes four seats and supports additional seats at $15 per month each.",
    rows: makeRows("UpKeep", 55),
    pricingTable: {
      heading: "UpKeep pricing in 2026",
      summary:
        "UpKeep lists Essential at $24 per paid user per month and Premium at $55 per paid user per month. Premium is the first public tier with PM scheduling, custom checklists, inventory costing, labor tracking, and 30-day analytics. Professional and Enterprise use custom pricing, and implementation or training packages are separate add-ons.",
      sourceLabel: "UpKeep's official pricing page",
      sourceUrl: "https://upkeep.com/pricing/?selected_plan=professional",
      verifiedOn: "2026-08-16",
      rows: [
        { plan: "Essential", competitorPrice: "$24/user/mo", mainteneasePrice: "Starter: $49/mo (2 seats)" },
        { plan: "Premium", competitorPrice: "$55/user/mo", mainteneasePrice: "Pro: $129/mo (4 seats)" },
        { plan: "Professional", competitorPrice: "Custom quote", mainteneasePrice: "Business: $299/mo (4 seats)" },
        { plan: "Enterprise", competitorPrice: "Custom quote", mainteneasePrice: "Business: $299/mo + $15/additional seat" },
      ],
    },
    competitorTiers: [
      { name: "Essential", price: "$24 / paid user / mo", notes: "Unlimited work orders and locations plus Nova AI; the public comparison does not include PM scheduling, inventory, or time-and-cost tracking." },
      { name: "Premium", price: "$55 / paid user / mo", notes: "Adds PM scheduling, custom checklists, parts and inventory costing, time and labor tracking, UpKeep Studio, and 30-day analytics history." },
      { name: "Professional", price: "Custom quote", notes: "Adds mobile offline mode, external request portal, full analytics history, asset lifecycle tracking, and signature capture." },
      { name: "Enterprise", price: "Custom quote", notes: "Adds multi-site modules, workflow automation, reliability and downtime tracking, purchase orders, API and integrations, SSO, custom roles, and dashboards." },
    ],
    sections: [
      {
        heading: "What the UpKeep plan ladder means",
        paragraphs: [
          "UpKeep's public pricing is per user per month. Essential is $24/user/mo, while Premium is $55/user/mo and is the first listed tier that includes preventive-maintenance scheduling. Professional and Enterprise require a quote.",
          "That structure means the bill grows with headcount. Five users on Premium cost about $275/month and eight cost about $440/month before add-ons or negotiated terms.",
          "UpKeep says View Only, Requester, and Third-Party users do not require paid licenses. Admin, Technical, and Limited Technical users do. Model the people who will administer or complete work separately from people who only request or view it rather than multiplying the price by total headcount.",
          "The public add-on list shows training-only service at $500, Quickstart implementation and training at $1,500, expanded training at $5,000, and custom Enterprise implementation by quote. The table above and these packages were verified against UpKeep's official pricing page on August 16, 2026. Packaging can change, so follow the source before budgeting.",
        ],
      },
      {
        heading: "Feature limits that change the right tier",
        paragraphs: [
          "Essential is positioned for teams leaving paper or spreadsheets, but UpKeep's public plan comparison does not include PM scheduling, checklists, inventory management, time-and-cost tracking, or full drill-down reporting on that tier. Premium adds those core preventive-maintenance workflows but lists only 30 days of analytics history.",
          "Professional is the first public tier with mobile offline mode, an external request portal, full analytics history, asset lifecycle tracking, and signature capture. Enterprise is the tier for multi-site modules, workflow automation, reliability and downtime reporting, purchase orders, API and custom integrations, SSO, custom roles, and custom dashboards. Buyers should map required workflows to the tier before comparing per-user price.",
        ],
      },
      {
        heading: "How MaintenEase pricing compares",
        paragraphs: [
          `MaintenEase publishes account plans with seats included rather than a per-technician rate. For the illustrative team of ${TEAM_SIZE} used across this site, the lowest MaintenEase plan that covers the seat count is ${MAINTENEASE_TEAM_PRICE.plan.name} at $${MAINTENEASE_TEAM_PRICE.monthlyPrice}/mo including ${MAINTENEASE_TEAM_PRICE.extraSeats} extra seats, against roughly $${55 * TEAM_SIZE}/mo for UpKeep Premium.`,
          "The bigger difference is behaviour as the crew changes. Adding a seasonal helper, a supervisor who only reads reports, or a second-shift technician moves an UpKeep bill by a full seat each time. On MaintenEase the plan covers its included seats, and Business adds seats at a published $15/mo each, so the increase is visible before you commit to it.",
          "MaintenEase is also month-to-month, so the listed price does not depend on signing an annual contract. Run your own headcount through the cost calculator rather than trusting either vendor's example team — there is a range where per-seat pricing genuinely wins, and the calculator shows where it flips.",
        ],
      },
      {
        heading: "Where UpKeep is the better choice",
        paragraphs: [
          "UpKeep is a mature, well-resourced product with a large customer base, an extensive integration marketplace, and enterprise procurement processes. If you are one to three paid users, per-seat math is simply cheaper for you. If you need deep IoT sensor programmes, an established partner ecosystem, or the reassurance of a large vendor for a long security review, UpKeep is a reasonable pick and this page is not going to pretend otherwise.",
          "MaintenEase makes the most sense when the crew is growing, when people outside the maintenance team need visibility, and when you want AI predictive scoring, energy tracking, a no-login request portal, and free data import included rather than priced as add-ons.",
        ],
      },
      {
        heading: "Migration considerations before switching from UpKeep",
        paragraphs: [
          "Export and reconcile assets, locations, open work orders, completed history, parts, users, files, PM schedules, checklists, meter readings, and custom fields before changing systems. Preserve stable IDs and parent-child relationships so asset history does not split during import. UpKeep's current work-order export documentation says a single export can include up to 500 work orders, so larger histories may require filtered batches and a reconciliation total.",
          "Decide how status, priority, category, user, and location values map before the import. Test a sample that includes attachments, recurring schedules, child assets, parts usage, and closed work. Run both systems during a short controlled cutover, freeze configuration changes, reconcile open work and next-due PM dates, then keep the old account read-only until the retention and contract requirements are satisfied.",
        ],
      },
    ],
    bestFit: {
      ours: [
        "Teams of roughly 5+ where headcount changes through the year",
        "Operations that want supervisors and office staff to see status without buying seats",
        "Buyers who want month-to-month billing and published seat costs",
        "Teams that want predictive scoring, energy tracking, and a request portal included",
      ],
      theirs: [
        "One to three paid users, where per-seat pricing is cheapest",
        "Large IoT sensor deployments and an extensive integration marketplace",
        "Enterprise procurement with long vendor security reviews",
      ],
    },
    migrationSteps: [
      { title: "Inventory and export", body: "Export assets, locations, users, parts, open work, PM schedules, and history. UpKeep currently documents a 500-work-order limit per export, so reconcile large histories in batches." },
      { title: "Send us the files", body: "We clean and map the columns and import them for free during onboarding — no re-keying and no per-record charge." },
      { title: "Run both for two weeks", body: "Keep UpKeep read-only while your team completes real work in MaintenEase, so nothing is lost in the switch." },
      { title: "Cut over and cancel", body: "Once PM schedules are generating correctly and the backlog matches, close the UpKeep subscription at the end of its term." },
    ],
    differentiators: [
      { title: "Published account and seat pricing", body: "Starter and Pro include seats up front. Business includes four seats and lists additional seats at $15 per month each, so the team can calculate the actual bill before switching." },
      { title: "Month-to-month", body: "MaintenEase is month-to-month — no annual contract required to get the listed price." },
      { title: "Free, hands-on migration", body: "We import your assets and open work orders for free so switching from UpKeep doesn't mean re-keying your data." },
    ],
    faqs: [
      {
        q: "How much does UpKeep cost per month?",
        a: "UpKeep pricing starts at $24 per paid user per month for Essential. Premium is $55 per paid user per month and is the first public tier with PM scheduling, so five paid Premium users cost roughly $275/month before add-ons. Professional and Enterprise require a quote. Prices and packaging verified August 16, 2026; check UpKeep's pricing page for changes.",
      },
      {
        q: "Does UpKeep have a free plan?",
        a: "UpKeep offers a free trial and says View Only, Requester, and Third-Party users do not require paid licenses. Admin, Technical, and Limited Technical users require paid licenses, so classify each role by the work it performs before estimating cost.",
      },
      pricingFaq("UpKeep", 55),
      {
        q: "What is the best UpKeep alternative?",
        a: "It depends on why you are leaving. If the trigger is per-seat cost as the crew grows, an account-plan product like MaintenEase changes the maths. If it is missing capability, compare on the specific workflow — procedures, IoT, or multi-site — rather than on price alone.",
      },
      affiliationFaq("UpKeep"),
      migrationFaq("UpKeep"),
    ],
    sources: [
      { label: "UpKeep official pricing and plan comparison", url: "https://upkeep.com/pricing/?selected_plan=professional" },
      { label: "UpKeep Help: Work-order export limits and formats", url: "https://help.onupkeep.com/en/collections/3653439-upkeep-work-orders" },
      { label: "UpKeep Help: Asset hierarchy and history behavior", url: "https://help.onupkeep.com/en/articles/4658340-create-and-edit-assets" },
    ],
  },
  {
    slug: "maintenease-vs-fiix",
    datePublished: "2026-07-25",
    dateModified: PRODUCT_LAST_MODIFIED,
    competitor: "Fiix",
    competitorPlan: "Basic",
    competitorPricePerUser: 45,
    metaTitle: "MaintenEase vs Fiix — CMMS Pricing Comparison (2026)",
    metaDescription:
      "MaintenEase vs Fiix: compare account plans with included seats against Fiix's per-user pricing. Review work orders, assets, PMs, and estimated team cost.",
    h1: "MaintenEase vs Fiix",
    tagline: "Account plans with included seats compared with per-user pricing.",
    intro:
      "Fiix publishes a free tier, Basic and Professional per-user plans, and custom Enterprise pricing. MaintenEase publishes account plans with included seats and capacity limits. This comparison uses Fiix's official pricing page for current plan facts and identifies the questions a buyer should verify before choosing or migrating.",
    rows: makeRows("Fiix", 45),
    pricingTable: {
      heading: "Fiix pricing verified in 2026",
      summary: "Fiix lists Free at $0, Basic at $45 per user per month, Professional at $75 per user per month, and Enterprise by custom quote. The free plan is limited to 25 active preventive-maintenance schedules.",
      sourceLabel: "Fiix's official pricing page",
      sourceUrl: "https://fiixsoftware.com/cmms/pricing/",
      verifiedOn: "2026-08-21",
      rows: [
        { plan: "Free", competitorPrice: "$0; 25 active PMs", mainteneasePrice: "7-day free trial" },
        { plan: "Basic", competitorPrice: "$45/user/mo", mainteneasePrice: "Starter: $49/mo (2 seats)" },
        { plan: "Professional", competitorPrice: "$75/user/mo", mainteneasePrice: "Pro: $129/mo (4 seats)" },
        { plan: "Enterprise", competitorPrice: "Custom quote", mainteneasePrice: "Business: $299/mo (4 seats)" },
      ],
    },
    sections: [
      {
        heading: "Start with the plan that contains the workflow",
        paragraphs: [
          "Do not compare Fiix Basic with MaintenEase Starter only because both are entry paid plans. List the workflows you need — preventive schedules, reports, purchasing, integrations, SSO, or multi-site controls — and confirm the first Fiix tier that includes each one on the official plan table.",
          "Then price the number of people who require paid access. Fiix's published Basic and Professional prices are per user; MaintenEase Starter, Pro, and Business include two, four, and four seats respectively, with Business adding seats at $15 per month each.",
        ],
      },
      {
        heading: "Migration questions to answer before signing",
        paragraphs: [
          "Ask both vendors for a sample export containing asset identifiers, locations, open and closed work orders, PM definitions, meter readings, parts, attachments, and audit history. Confirm which fields and files are included, how relationships are represented, and whether an administrator can run the export without a paid service.",
          "Pilot with a small asset set and several real work orders. Measure completion steps, mobile connectivity needs, supervisor review, notification noise, and the effort required to recreate recurring schedules. A buyer should treat those observed results as more useful than generic feature checkmarks.",
        ],
      },
    ],
    competitorTiers: [
      { name: "Free", price: "$0", notes: "Official page lists a 25-active-PM limit." },
      { name: "Basic", price: "$45/user/mo", notes: "Published entry paid tier." },
      { name: "Professional", price: "$75/user/mo", notes: "Published higher paid tier." },
      { name: "Enterprise", price: "Custom quote", notes: "Contact Fiix for pricing and terms." },
    ],
    bestFit: {
      ours: [
        "You prefer published account pricing with included seats and capacity limits.",
        "Business's published $15 monthly additional-seat rate fits your growth model.",
        "The MaintenEase trial covers the workflows and data relationships you validated in a pilot.",
      ],
      theirs: [
        "Fiix's official plan table includes a required workflow that MaintenEase does not substantiate.",
        "A Fiix pilot performs better for your technicians and supervisors.",
        "Your procurement requirements favor the Fiix Enterprise proposal after total-cost review.",
      ],
    },
    differentiators: [
      { title: "Predictable published billing", body: "The pricing page shows included seats, capacity limits, and the Business extra-seat rate so a growing team can calculate its monthly cost." },
      { title: "Compare required workflows", body: "Map each required workflow to the first eligible plan and verify it in a pilot instead of relying on a generic feature checklist." },
      { title: "Test migration evidence", body: "Use a representative export and pilot asset set to verify history, attachments, preventive schedules, and field relationships before committing." },
    ],
    faqs: [
      pricingFaq("Fiix", 45),
      { q: "How much does Fiix cost?", a: "Fiix lists Free at $0, Basic at $45 per user per month, Professional at $75 per user per month, and Enterprise by custom quote. Pricing verified on August 21, 2026; check Fiix's official page for changes." },
      affiliationFaq("Fiix"),
      migrationFaq("Fiix"),
    ],
    sources: [{ label: "Fiix official CMMS pricing", url: "https://fiixsoftware.com/cmms/pricing/" }],
  },
  {
    slug: "maintenease-vs-maintainx",
    competitor: "MaintainX",
    competitorPlan: "Essential",
    competitorPricePerUser: 20,
    // Last substantive content change per version history (latest commit that
    // touched this file's comparison content): 2026-07-25. No earlier reliable
    // publication record exists in the squashed history, so publication is
    // recorded as the same date rather than fabricating an older one.
    datePublished: "2026-07-25",
    dateModified: "2026-08-13",
    metaTitle: "MaintenEase vs MaintainX — CMMS Pricing Comparison (2026)",
    metaDescription:
      "MaintenEase vs MaintainX: compare features and estimated team cost across MaintenEase account plans and MaintainX per-user pricing.",
    h1: "MaintenEase vs MaintainX",
    tagline: "Account plans with included seats and published capacity limits.",
    intro:
      "MaintainX is a popular work-order and procedure app billed per user per month, with a free tier for very small teams and paid tiers that unlock reporting, PMs, and analytics. MaintenEase covers the same everyday workflow — work orders, assets and history, preventive maintenance, inspections, mobile access, and reporting — through account plans with included seats. This page lays out where the products overlap, where MaintainX is the better fit, and how the published pricing models compare.",
    rows: makeRows("MaintainX", 20),
    pricingTable: {
      heading: "MaintainX cost in 2026",
      summary:
        "MaintainX lists a free Basic plan, Essential at $20 per user per month on annual billing ($25 monthly), and Premium at $65 per user per month annually ($75 monthly). Requesters remain free; paid users drive the recurring cost.",
      sourceLabel: "MaintainX's official pricing page",
      sourceUrl: "https://www.getmaintainx.com/pricing",
      verifiedOn: "2026-08-13",
      rows: [
        { plan: "Basic", competitorPrice: "Free", mainteneasePrice: "7-day free trial" },
        { plan: "Essential", competitorPrice: "$20/user/mo annual; $25 monthly", mainteneasePrice: "Starter: $49/mo (2 seats)" },
        { plan: "Premium", competitorPrice: "$65/user/mo annual; $75 monthly", mainteneasePrice: "Pro: $129/mo (4 seats)" },
        { plan: "Enterprise", competitorPrice: "Custom quote", mainteneasePrice: "Business: $299/mo (4 seats)" },
      ],
    },
    sections: [
      {
        heading: "The short answer",
        paragraphs: [
          "Both products are cloud CMMS tools built around mobile work orders: a request comes in, it becomes a work order, a technician completes it on their phone, and the asset keeps a service history. If you are comparing them, you are almost certainly not choosing between \"can it do work orders\" — both can.",
          "The real decision is pricing model and breadth. MaintainX bills per user per month, with capability gated by tier, and is strongest when work is procedure-driven. MaintenEase Starter and Pro include published seat and record limits; Business includes unlimited assets and work orders, four seats, and additional seats at $15 per month each. Predictive maintenance is available on Pro and Business.",
          "Run your actual team size in the calculator. It now selects the lowest MaintenEase plan that covers the seat count and adds the published Business extra-seat cost when needed. Asset or work-order volume can still require a higher plan.",
        ],
      },
      {
        heading: "Cost as your crew grows",
        paragraphs: [
          "Per-seat pricing means your software bill is a function of headcount. At the publicly listed $20/user/mo annual rate for Essential, five paid users are $100/mo, eight are $160/mo, fifteen are $300/mo, and twenty-five are $500/mo. The month-to-month Essential rate is $25/user/mo. MaintenEase account pricing uses included seats and publishes the Business extra-seat rate.",
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
          "Cost predictability comes from explicit plan limits: Starter and Pro include seats up front, while Business publishes the price of each additional seat. A new hire can change the bill, but the rate is visible before the seat is added.",
          "Beyond price, MaintenEase includes things per-seat CMMS products often push to a higher tier or an add-on: AI predictive maintenance scoring on your asset history, energy and power usage tracking alongside maintenance cost, digital inspections and checklists, a public request portal that tenants or staff use without an account, an AI assistant over your own data, and an MCP/agent API so tools like ChatGPT or Claude can read work orders and create them with your permission.",
          "Onboarding is the other practical difference. We import your assets, open work orders, and PM schedules for free and set up your first reports with you, rather than handing you a CSV template and a help centre article.",
        ],
      },
      {
        heading: "What comparison pages usually leave out",
        paragraphs: [
          "Requester and view-only access. Ask any vendor, including us, exactly who counts as a billable user. MaintainX publicly advertises unlimited free requesters; that matters. MaintenEase requests can arrive through a public link with no login, while staff who use the application count against the included or paid seat total.",
          "Annual versus monthly. Advertised per-user prices are usually the annual-commitment rate; paying monthly typically costs more. MaintenEase's listed prices are month-to-month, so compare like with like before you conclude anything about savings.",
          "Tier gating. With tiered per-seat products, the price you compare is often not the price you end up on, because reporting, PM automation, or analytics live a tier up. Write down the three features you actually need, then check which tier contains all three.",
          "Exit cost. Ask both vendors how you get your data out — asset lists, work order history with attachments, and PM definitions. MaintenEase exports to CSV/Excel on demand; confirm the equivalent before you commit anywhere.",
        ],
      },
    ],
    competitorTiers: [
      { name: "Basic", price: "Free", notes: "Publicly listed free tier for very small teams, with usage limits." },
      { name: "Essential", price: "$20 annual / $25 monthly per user", notes: "Entry paid tier used for the cost comparison on this page." },
      { name: "Premium", price: "$65 annual / $75 monthly per user", notes: "Adds higher-tier reporting and analytics capability." },
      { name: "Enterprise", price: "Custom quote", notes: "Negotiated pricing and enterprise controls." },
    ],
    bestFit: {
      ours: [
        "You have roughly six or more people who need access, including supervisors and office staff.",
        "You want published account pricing and a known $15 monthly rate for each additional Business seat.",
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
      { title: "Published account and seat costs", body: "Starter and Pro include seats up front. Business includes four seats and adds seats at $15 per month each; use the calculator for the current team-size estimate." },
      { title: "No annual lock-in", body: "MaintenEase's listed prices are month-to-month — cancel or change plans anytime, with no annual commitment needed to get the advertised rate." },
      { title: "Capabilities by plan", body: "Digital inspections and the public request portal support day-to-day intake, while predictive maintenance is included on Pro and Business. The pricing page lists each plan's current capabilities and limits." },
      { title: "Free, hands-on onboarding", body: "We import your assets, open work orders, and PM schedules and help build the initial setup. Timing depends on the volume and condition of the source data." },
    ],
    faqs: [
      pricingFaq("MaintainX", 20),
      {
        q: "How much does MaintainX cost per user?",
        a: "MaintainX cost starts at $0 for Basic. Essential is $20 per user per month with annual billing or $25 monthly; Premium is $65 per user per month annually or $75 monthly. Enterprise requires a quote. Prices verified August 13, 2026; check MaintainX's pricing page for changes.",
      },
      {
        q: "At what team size does MaintenEase become cheaper than MaintainX?",
        a: "Use the CMMS cost calculator for the current estimate. It selects Starter for up to two seats, Pro for up to four, and Business above four, then adds Business seats at $15 per month each. It also shows when the listed MaintainX tier costs less.",
      },
      {
        q: "Is MaintenEase a good MaintainX alternative for a small team?",
        a: "MaintainX's free or per-seat tier may cost less for some small teams, and that is a fair reason to stay. MaintenEase Starter is $49/month with two seats; Pro is $129/month with four seats and predictive maintenance. Compare the features and capacity required, not only the headline price.",
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
        a: "Public requesters do not need an account. Staff who use MaintenEase count toward the plan's included seats; Business supports additional seats at $15 per month each.",
      },
      migrationFaq("MaintainX"),
      affiliationFaq("MaintainX"),
    ],
  },
  {
    slug: "maintenease-vs-limble",
    dateModified: "2026-08-13",
    competitor: "Limble",
    competitorPlan: "Standard",
    competitorPricePerUser: null,
    metaTitle: "MaintenEase vs Limble — CMMS Pricing Comparison (2026)",
    metaDescription:
      "MaintenEase vs Limble CMMS: compare account plans with included seats against per-user pricing across work orders, assets, PM, and estimated team cost.",
    h1: "MaintenEase vs Limble",
    tagline: "Account and per-user pricing for preventive maintenance teams.",
    intro:
      "Limble is a modern CMMS that now asks buyers to calculate an estimate or request pricing rather than publishing dollar amounts for its Standard, Premium+, and Enterprise plans. MaintenEase covers the same day-to-day — work orders, asset management, preventive and predictive maintenance, inspections, and reporting — through published account plans with included seats. Business adds seats at $15 per month each.",
    rows: makeRows("Limble", null),
    pricingTable: {
      heading: "Limble pricing in 2026",
      summary:
        "Limble publishes the features in Standard, Premium+, and Enterprise, but it does not publish fixed dollar prices. Its official pricing page sends buyers to a calculator for an estimate, so the only defensible current price is 'custom estimate' until Limble provides your quote.",
      sourceLabel: "Limble's official pricing page",
      sourceUrl: "https://limble.com/pricing",
      verifiedOn: "2026-08-13",
      rows: [
        { plan: "Standard", competitorPrice: "Custom estimate", mainteneasePrice: "Starter: $49/mo (2 seats)" },
        { plan: "Premium+", competitorPrice: "Custom estimate", mainteneasePrice: "Pro: $129/mo (4 seats)" },
        { plan: "Enterprise", competitorPrice: "Custom estimate", mainteneasePrice: "Business: $299/mo (4 seats)" },
      ],
    },
    competitorTiers: [
      { name: "Standard", price: "Custom estimate", notes: "Unlimited assets, work orders, PMs, requesters, and custom dashboards." },
      { name: "Premium+", price: "Custom estimate", notes: "Adds offline mode, parts, vendors, purchasing, meter scheduling, API access, and a customer success manager." },
      { name: "Enterprise", price: "Custom estimate", notes: "Adds multi-location controls, custom roles and approvals, compliance, SSO, and integrations." },
    ],
    sections: [
      {
        heading: "Why Limble cost requires a quote",
        paragraphs: [
          "Limble's current pricing page describes three plans and provides a two-question calculator, but it does not expose a per-user or account price in the public page content. Team size, plan, and negotiated terms can therefore change the quote.",
          "That makes a direct monthly-cost claim unreliable. Ask Limble for the all-in monthly and annual totals, implementation cost, minimum seat count, and renewal terms, then compare that written quote with MaintenEase's published account price.",
        ],
      },
    ],
    differentiators: [
      { title: "Costs you can calculate", body: "Included seats and the Business extra-seat rate are published, so a new hire's effect on the software bill is visible in advance." },
      { title: "Everything in one place", body: "Work orders, assets, PMs, predictive maintenance, and energy tracking under one login." },
      { title: "Switch for free", body: "Free data import and onboarding make moving from Limble low-effort." },
    ],
    faqs: [
      {
        q: "How much does Limble cost?",
        a: "Limble pricing is not published as a fixed dollar amount in 2026. Standard, Premium+, and Enterprise all route buyers to Limble's calculator for a custom estimate. Ask for the total monthly and annual price, implementation fees, minimum seats, and renewal terms before comparing it with another CMMS.",
      },
      affiliationFaq("Limble"),
      migrationFaq("Limble"),
    ],
  },
  {
    slug: "maintenease-vs-emaint",
    datePublished: "2026-07-25",
    dateModified: PRODUCT_LAST_MODIFIED,
    competitor: "eMaint",
    competitorPlan: "Professional / Enterprise",
    competitorPricePerUser: null,
    metaTitle: "MaintenEase vs eMaint — CMMS Pricing Alternative",
    metaDescription:
      "MaintenEase vs eMaint: compare published MaintenEase plans with eMaint's configurable pricing, minimum users, selection criteria, and migration questions.",
    h1: "MaintenEase vs eMaint",
    tagline: "Published account plans compared with configurable eMaint pricing.",
    intro:
      "eMaint, a Fluke Reliability product, currently asks buyers to configure a package or request pricing. Its official pricing page does not substantiate the fixed per-user amount previously shown on this comparison. MaintenEase publishes Starter, Pro, and Business account prices, included seats, capacity limits, and the Business extra-seat rate.",
    rows: makeRows("eMaint", null),
    pricingTable: {
      heading: "eMaint pricing: request a configured quote",
      summary: "eMaint's official page describes flexible, configurable pricing rather than a current public dollar amount. Professional has a three-user minimum and Enterprise has a five-user minimum; buyers should confirm included modules, services, term, and total cost in the quote.",
      sourceLabel: "eMaint's official pricing page",
      sourceUrl: "https://www.emaint.com/pricing",
      verifiedOn: "2026-08-21",
      rows: [
        { plan: "Professional", competitorPrice: "Custom; 3-user minimum", mainteneasePrice: "Pro: $129/mo (4 seats)" },
        { plan: "Enterprise", competitorPrice: "Custom; 5-user minimum", mainteneasePrice: "Business: $299/mo (4 seats)" },
      ],
    },
    sections: [
      {
        heading: "Why there is no eMaint savings calculation",
        paragraphs: [
          "A valid team-cost comparison requires a current public price or a buyer's actual quote. eMaint does not publish a fixed dollar amount on its current pricing page, so this page does not multiply an old price by headcount or claim a savings figure.",
          "Ask eMaint for the recurring subscription, user minimum, modules, implementation services, training, integrations, data migration, support, contract term, renewal terms, and taxes. Compare that proposal with the MaintenEase plan that satisfies both seat and record-volume requirements.",
        ],
      },
      {
        heading: "Evaluate fit with evidence from your workflow",
        paragraphs: [
          "Build a pilot script from real tasks: submit a request, plan a preventive work order, attach evidence, consume a part, review asset history, approve completion, and export the record. Run the same script in each product and record where required fields, permissions, or integrations differ.",
          "For migration, inspect a representative export before signing. Verify stable asset IDs, locations, PM frequencies, meter values, work-order status history, labor and parts, attachments, and audit fields. Do not assume a marketing checklist proves that historical relationships will transfer cleanly.",
        ],
      },
    ],
    competitorTiers: [
      { name: "Professional", price: "Custom quote", notes: "Official page states a three-user minimum." },
      { name: "Enterprise", price: "Custom quote", notes: "Official page states a five-user minimum." },
    ],
    bestFit: {
      ours: [
        "You need published monthly account prices and capacity limits before talking to sales.",
        "Starter, Pro, or Business covers the validated workflow and required record volume.",
        "You want each additional Business seat priced publicly at $15 per month.",
      ],
      theirs: [
        "eMaint's configured proposal includes required services or workflows that you verify in a pilot.",
        "Your organization accepts the quoted user minimum, term, services, and total cost.",
        "Your migration test preserves the records and relationships required by policy.",
      ],
    },
    differentiators: [
      { title: "Published MaintenEase pricing", body: "Starter, Pro, and Business list monthly and annual prices, included seats, capacity limits, and support channels in one catalog." },
      { title: "Quote-based eMaint comparison", body: "eMaint cost remains custom until the buyer has a current configured proposal; this page does not calculate savings from an unsupported historical price." },
      { title: "Workflow and migration test", body: "Evaluate both products with the same real tasks and a representative export before choosing." },
    ],
    faqs: [
      { q: "How much does eMaint cost?", a: "eMaint's official pricing page uses configurable pricing and does not publish a current fixed dollar amount. Professional has a three-user minimum and Enterprise has a five-user minimum. Verified August 21, 2026; request a current quote for total cost." },
      { q: "Why does this page not show eMaint savings?", a: "Without a current public price or your actual quote, multiplying an old number by user count would be misleading. Compare the complete eMaint proposal with the MaintenEase plan that satisfies your seats and capacity." },
      affiliationFaq("eMaint"),
      migrationFaq("eMaint"),
    ],
    sources: [{ label: "eMaint official pricing", url: "https://www.emaint.com/pricing" }],
  },
];

export type PricedComparison = Comparison & { competitorPricePerUser: number };

/** Comparisons with a current public per-user price, safe for cost calculators. */
export const pricedComparisons = comparisons.filter(
  (comparison): comparison is PricedComparison => comparison.competitorPricePerUser !== null,
);

export const getComparison = (slug: string) => comparisons.find((c) => c.slug === slug);

/**
 * The MaintainX page has six page-specific FAQs followed by two shared
 * migration/affiliation FAQs. Its requested FAQPage markup covers only the
 * six page-specific questions; every other comparison marks up its full list.
 */
export const getFaqSchemaEntries = (comparison: Comparison) =>
  comparison.slug === "maintenease-vs-maintainx"
    ? comparison.faqs.slice(0, 6)
    : comparison.faqs;
