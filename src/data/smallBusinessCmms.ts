/**
 * Data for /best-cmms-software-for-small-business.
 *
 * Every competitor price, plan note and source on that page is read from
 * `comparisons.ts`, so the roundup can never drift from the per-vendor
 * comparison pages or cite a figure that has not been checked against the
 * vendor's own pricing page. Only the short "fits" lines live here, and they
 * restate the best-fit guidance already published on each /compare page.
 */
import { comparisons, type Comparison } from "@/data/comparisons";
import { PLAN_BY_TIER, PRODUCT_LAST_MODIFIED, getMaintenEaseTeamPrice } from "@/data/productCatalog";

export const SMALL_BUSINESS_CMMS_PATH = "/best-cmms-software-for-small-business";
export const SMALL_BUSINESS_CMMS_PUBLISHED = "2026-11-15";
export const SMALL_BUSINESS_TEAM_SIZES = [4, 8, 12] as const;

const FITS: Record<string, string> = {
  "maintenease-vs-maintainx":
    "Teams that want the lowest listed per-user price, or whose work centres on standardised procedures and SOP libraries.",
  "maintenease-vs-upkeep":
    "One to three paid users who want a mobile-first tool and can stay on a per-user plan.",
  "maintenease-vs-fiix":
    "Teams that want to start on a $0 tier and can work within its preventive-maintenance schedule limit.",
  "maintenease-vs-limble":
    "Teams that are comfortable requesting an estimate before they see a price.",
  "maintenease-vs-emaint":
    "Organisations that accept a quoted price, a user minimum and a configured rollout.",
};

export type SmallBusinessCmmsOption = {
  name: string;
  fits: string;
  pricingSummary: string;
  pricePerUser: number | null;
  sourceLabel: string;
  sourceUrl: string;
  verifiedOn: string;
  compareHref: string | null;
};

const fromComparison = (comparison: Comparison): SmallBusinessCmmsOption | null => {
  const fits = FITS[comparison.slug];
  if (!fits || !comparison.pricingTable) return null;
  return {
    name: comparison.competitor,
    fits,
    pricingSummary: comparison.pricingTable.summary,
    pricePerUser: comparison.competitorPricePerUser,
    sourceLabel: comparison.pricingTable.sourceLabel,
    sourceUrl: comparison.pricingTable.sourceUrl,
    verifiedOn: comparison.pricingTable.verifiedOn,
    compareHref: `/compare/${comparison.slug}`,
  };
};

export const MAINTENEASE_OPTION: SmallBusinessCmmsOption = {
  name: "MaintenEase",
  fits: "Crews that fit in four seats, or larger crews that keep adding people and want each extra seat to cost $15 instead of a full per-user fee.",
  pricingSummary: `MaintenEase publishes three account plans: Starter at $${PLAN_BY_TIER.starter.monthlyPrice} per month with ${PLAN_BY_TIER.starter.includedSeats} seats, Pro at $${PLAN_BY_TIER.pro.monthlyPrice} per month with ${PLAN_BY_TIER.pro.includedSeats} seats, and Business at $${PLAN_BY_TIER.business.monthlyPrice} per month with ${PLAN_BY_TIER.business.includedSeats} seats and additional seats at $${PLAN_BY_TIER.business.extraSeatMonthlyPrice} each. Starter and Pro have asset and monthly work-order limits.`,
  pricePerUser: null,
  sourceLabel: "MaintenEase pricing",
  sourceUrl: "https://maintenease.com/pricing",
  verifiedOn: PRODUCT_LAST_MODIFIED,
  compareHref: null,
};

export const COMPETITOR_OPTIONS: SmallBusinessCmmsOption[] = comparisons
  .map(fromComparison)
  .filter((option): option is SmallBusinessCmmsOption => option !== null);

export const SMALL_BUSINESS_CMMS_OPTIONS: SmallBusinessCmmsOption[] = [MAINTENEASE_OPTION, ...COMPETITOR_OPTIONS];

/** Latest date any figure on the page was checked; drives lastmod and the visible date. */
export const SMALL_BUSINESS_CMMS_UPDATED = [SMALL_BUSINESS_CMMS_PUBLISHED, ...SMALL_BUSINESS_CMMS_OPTIONS.map((o) => o.verifiedOn)]
  .sort()
  .at(-1) as string;

export type TeamCostRow = { name: string; costs: (number | null)[] };

export const TEAM_COST_ROWS: TeamCostRow[] = [
  { name: "MaintenEase", costs: SMALL_BUSINESS_TEAM_SIZES.map((size) => getMaintenEaseTeamPrice(size).monthlyPrice) },
  ...COMPETITOR_OPTIONS.map((option) => ({
    name: option.name,
    costs: SMALL_BUSINESS_TEAM_SIZES.map((size) => (option.pricePerUser === null ? null : option.pricePerUser * size)),
  })),
];

/** Vendor with the lowest listed monthly cost at each team size, computed from the table. */
export const LOWEST_LISTED_BY_SIZE: { size: number; name: string; cost: number }[] = SMALL_BUSINESS_TEAM_SIZES.map(
  (size, index) => {
    const priced = TEAM_COST_ROWS.flatMap((row) => (row.costs[index] === null ? [] : [{ name: row.name, cost: row.costs[index] as number }]));
    const lowest = priced.reduce((best, row) => (row.cost < best.cost ? row : best));
    return { size, ...lowest };
  },
);

export const LOWEST_LISTED_SUMMARY = LOWEST_LISTED_BY_SIZE.map(
  (entry) => `${entry.name} at ${entry.size} users ($${entry.cost}/mo)`,
).join(", ");

export const SMALL_BUSINESS_CMMS_FAQS = [
  {
    q: "What is the cheapest CMMS for a small business?",
    a: `Among the vendors here that publish a price, the lowest listed monthly cost is ${LOWEST_LISTED_SUMMARY}. The lowest price is not always the right plan: confirm that the tier includes preventive-maintenance scheduling, parts and the reporting you need.`,
  },
  {
    q: "Is there a free CMMS?",
    a: "Some vendors list a $0 tier with limits. Read the limit that matters for you, such as the number of preventive-maintenance schedules, before you build your asset list in it.",
  },
  {
    q: "Who wrote this comparison?",
    a: "MaintenEase publishes this page and is one of the products on it. Competitor prices come from each vendor's own pricing page on the date shown next to it, and the page says where a competitor is the cheaper choice.",
  },
  {
    q: "What should a small team check before buying a CMMS?",
    a: "Ask for the all-in monthly and annual totals, the minimum seat count, any onboarding or training fee, and the renewal terms. Then run one real work order and one preventive-maintenance schedule in a trial before you import everything.",
  },
];
