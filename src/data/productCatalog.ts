import { TRIAL_CANCEL_BY_DAY, TRIAL_DAYS } from "@/constants/trial";

export const SITE_ORIGIN = "https://maintenease.com";
export const PRICING_URL = `${SITE_ORIGIN}/pricing`;
export const PRODUCT_NAME = "MaintenEase CMMS";
export const PRODUCT_LAST_MODIFIED = "2026-08-07";
export const PRICE_CURRENCY = "USD";
export const EXTRA_BUSINESS_SEAT_MONTHLY = 15;

export type PlanTier = "starter" | "pro" | "business";

export type ProductPlan = {
  tier: PlanTier;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  includedSeats: number;
  extraSeatMonthlyPrice: number | null;
  assetLimit: number | null;
  monthlyWorkOrderLimit: number | null;
  description: string;
  popular?: boolean;
  capabilities: {
    analytics: boolean;
    automations: boolean;
    api: boolean;
    sso: boolean;
    predictiveMaintenance: boolean;
  };
  featureLabels: string[];
};

export const PRODUCT_PLANS: ProductPlan[] = [
  {
    tier: "starter",
    name: "Starter",
    monthlyPrice: 49,
    annualPrice: 490,
    includedSeats: 2,
    extraSeatMonthlyPrice: null,
    assetLimit: 50,
    monthlyWorkOrderLimit: 100,
    description: "For small teams getting organized.",
    capabilities: {
      analytics: false,
      automations: false,
      api: false,
      sso: false,
      predictiveMaintenance: false,
    },
    featureLabels: [
      "2 included seats",
      "Up to 50 assets",
      "100 work orders/mo",
      "Mobile access",
      "Email support",
    ],
  },
  {
    tier: "pro",
    name: "Pro",
    monthlyPrice: 129,
    annualPrice: 1290,
    includedSeats: 4,
    extraSeatMonthlyPrice: null,
    assetLimit: 500,
    monthlyWorkOrderLimit: 2_000,
    description: "For growing maintenance teams.",
    popular: true,
    capabilities: {
      analytics: true,
      automations: true,
      api: false,
      sso: false,
      predictiveMaintenance: true,
    },
    featureLabels: [
      "4 included seats",
      "Up to 500 assets",
      "2,000 work orders/mo",
      "Predictive maintenance",
      "Full analytics & reports",
      "Automations",
      "Priority email support",
    ],
  },
  {
    tier: "business",
    name: "Business",
    monthlyPrice: 299,
    annualPrice: 2990,
    includedSeats: 4,
    extraSeatMonthlyPrice: EXTRA_BUSINESS_SEAT_MONTHLY,
    assetLimit: null,
    monthlyWorkOrderLimit: null,
    description: "For larger organizations and higher-volume operations.",
    capabilities: {
      analytics: true,
      automations: true,
      api: true,
      sso: true,
      predictiveMaintenance: true,
    },
    featureLabels: [
      "4 included seats",
      "$15/extra seat/mo",
      "Unlimited assets",
      "Unlimited work orders",
      "Predictive maintenance",
      "Full analytics & exports",
      "Automations + API",
      "SSO",
      "Email + chat support",
    ],
  },
];

export const PLAN_BY_TIER = Object.fromEntries(
  PRODUCT_PLANS.map((plan) => [plan.tier, plan]),
) as Record<PlanTier, ProductPlan>;

export const PRODUCT_DESCRIPTION =
  "Cloud maintenance management software for work orders, assets, preventive maintenance, inspections, reporting, and equipment risk prioritization.";

export const COMMON_PLAN_FACTS = [
  `${TRIAL_DAYS}-day free trial on every plan`,
  `Card required — cancel before day ${TRIAL_CANCEL_BY_DAY} to avoid a charge`,
  "Free onboarding and data import",
  "Unlimited locations, asset images, and mobile access",
];

export const PRICING_SUMMARY = PRODUCT_PLANS.map(
  (plan) => `${plan.name} $${plan.monthlyPrice}/month (${plan.includedSeats} included seats)`,
).join(", ");

export const PLAN_CAPACITY_SUMMARY =
  "Starter supports up to 50 assets and 100 work orders per month. Pro supports up to 500 assets and 2,000 work orders per month. Business includes unlimited assets and unlimited work orders.";

export const PLAN_SEAT_SUMMARY =
  "Starter includes 2 seats, Pro includes 4 seats, and Business includes 4 seats with additional seats at $15 per month each.";

export type MaintenEaseTeamPrice = {
  plan: ProductPlan;
  teamSize: number;
  extraSeats: number;
  monthlyPrice: number;
};

/**
 * Lowest published monthly plan that can cover the requested seat count.
 * Capacity needs can still require a higher plan, which the UI states clearly.
 */
export function getMaintenEaseTeamPrice(rawTeamSize: number): MaintenEaseTeamPrice {
  const teamSize = Math.max(1, Math.round(rawTeamSize));
  if (teamSize <= PLAN_BY_TIER.starter.includedSeats) {
    return { plan: PLAN_BY_TIER.starter, teamSize, extraSeats: 0, monthlyPrice: 49 };
  }
  if (teamSize <= PLAN_BY_TIER.pro.includedSeats) {
    return { plan: PLAN_BY_TIER.pro, teamSize, extraSeats: 0, monthlyPrice: 129 };
  }

  const plan = PLAN_BY_TIER.business;
  const extraSeats = teamSize - plan.includedSeats;
  return {
    plan,
    teamSize,
    extraSeats,
    monthlyPrice: plan.monthlyPrice + extraSeats * EXTRA_BUSINESS_SEAT_MONTHLY,
  };
}

const organizationId = `${SITE_ORIGIN}/#organization`;
const brandId = `${SITE_ORIGIN}/#brand`;
const softwareId = `${SITE_ORIGIN}/#software`;

export const ORGANIZATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  "@id": organizationId,
  name: "MaintenEase",
  url: `${SITE_ORIGIN}/`,
  logo: {
    "@type": "ImageObject",
    url: `${SITE_ORIGIN}/favicon.png`,
    contentUrl: `${SITE_ORIGIN}/favicon.png`,
    caption: "MaintenEase logo",
  },
  brand: { "@id": brandId },
  sameAs: ["https://twitter.com/maintenease"],
};

export const BRAND_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Brand",
  "@id": brandId,
  name: "MaintenEase",
  url: `${SITE_ORIGIN}/`,
  logo: `${SITE_ORIGIN}/favicon.png`,
};

export const WEBSITE_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  "@id": `${SITE_ORIGIN}/#website`,
  name: "MaintenEase",
  url: `${SITE_ORIGIN}/`,
  publisher: { "@id": organizationId },
  inLanguage: "en-US",
  potentialAction: {
    "@type": "SearchAction",
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_ORIGIN}/learn?q={search_term_string}`,
    },
    "query-input": "required name=search_term_string",
  },
};

export const PLAN_OFFERS_JSON_LD = PRODUCT_PLANS.flatMap((plan) => [
  {
    "@type": "Offer",
    "@id": `${PRICING_URL}#${plan.tier}-monthly`,
    name: `${plan.name} monthly subscription`,
    url: `${PRICING_URL}#plan-${plan.tier}`,
    price: String(plan.monthlyPrice),
    priceCurrency: PRICE_CURRENCY,
    availability: "https://schema.org/InStock",
    seller: { "@id": organizationId },
    category: "SaaS subscription",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: String(plan.monthlyPrice),
      priceCurrency: PRICE_CURRENCY,
      billingDuration: "P1M",
    },
  },
  {
    "@type": "Offer",
    "@id": `${PRICING_URL}#${plan.tier}-annual`,
    name: `${plan.name} annual subscription`,
    url: `${PRICING_URL}#plan-${plan.tier}`,
    price: String(plan.annualPrice),
    priceCurrency: PRICE_CURRENCY,
    availability: "https://schema.org/InStock",
    seller: { "@id": organizationId },
    category: "SaaS subscription",
    priceSpecification: {
      "@type": "UnitPriceSpecification",
      price: String(plan.annualPrice),
      priceCurrency: PRICE_CURRENCY,
      billingDuration: "P1Y",
    },
  },
]);

export const SOFTWARE_APPLICATION_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "@id": softwareId,
  name: PRODUCT_NAME,
  alternateName: "MaintenEase",
  description: PRODUCT_DESCRIPTION,
  url: `${SITE_ORIGIN}/`,
  applicationCategory: "BusinessApplication",
  applicationSubCategory: "Computerized maintenance management system",
  operatingSystem: "Web browser",
  inLanguage: "en-US",
  dateModified: PRODUCT_LAST_MODIFIED,
  image: {
    "@type": "ImageObject",
    contentUrl: `${SITE_ORIGIN}/og-image.png?v=4`,
    caption: "MaintenEase CMMS — maintenance management software for facility and maintenance teams",
  },
  brand: { "@id": brandId },
  provider: { "@id": organizationId },
  offers: PLAN_OFFERS_JSON_LD,
};

export const PRODUCT_JSON_LD = {
  "@context": "https://schema.org",
  "@type": "Product",
  "@id": `${PRICING_URL}#product`,
  name: PRODUCT_NAME,
  description: PRODUCT_DESCRIPTION,
  url: PRICING_URL,
  category: "CMMS software subscription",
  inLanguage: "en-US",
  dateModified: PRODUCT_LAST_MODIFIED,
  image: {
    "@type": "ImageObject",
    contentUrl: `${SITE_ORIGIN}/og-image.png?v=4`,
    caption: "MaintenEase CMMS subscription plans",
  },
  brand: { "@id": brandId },
  manufacturer: { "@id": organizationId },
  isRelatedTo: { "@id": softwareId },
  offers: PLAN_OFFERS_JSON_LD,
};

export function buildItemListJsonLd(
  name: string,
  url: string,
  items: { name: string; url: string; description?: string }[],
) {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name,
    url,
    numberOfItems: items.length,
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      url: item.url,
      ...(item.description ? { description: item.description } : {}),
    })),
  };
}
