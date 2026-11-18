import { SIGNUP_PATH } from "@/data/signupRoute";

/**
 * Critical CSS + HTML shell for marketing detail pages (solutions, comparisons)
 * so LCP paints at final size before React hydrates.
 *
 * Class strings are shared with `SolutionPage` / `ComparePage` where noted.
 */
export const SOLUTION_PAGE_HERO_H1_CLASS =
  "font-headline text-4xl md:text-5xl font-bold tracking-normal mb-8 max-w-3xl text-foreground";

export const MARKETING_BREADCRUMB_NAV_CLASS = "text-sm text-muted-foreground mb-6";
export const MARKETING_BREADCRUMB_LINK_CLASS = "hover:text-primary transition-colors";

/** Solution hero intro — same classes as `SolutionPage`. */
export const SOLUTION_PAGE_INTRO_CLASS =
  "text-muted-foreground text-lg leading-relaxed max-w-3xl mb-8";

export const MARKETING_HERO_CTA_WRAP_CLASS = "mb-12";

/** Classes applied to the `<a>` inside `Button asChild size="lg"` on marketing heroes. */
export const MARKETING_HERO_PRIMARY_CTA_LINK_CLASS =
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-semibold h-12 px-6 text-base bg-primary text-primary-foreground shadow-md";

export const MARKETING_HERO_CTA_TEXT = "Start free trial";

export const SOLUTION_HERO_BREADCRUMB = {
  href: "/solutions",
  label: "Solutions",
} as const;

export const COMPARE_HERO_BREADCRUMB = {
  href: "/compare",
  label: "Compare",
} as const;

/** Substrings every solution-detail prerender hero must include (parity with `SolutionPage`). */
export const SOLUTION_HERO_PARITY_MARKERS = [
  `href="${SOLUTION_HERO_BREADCRUMB.href}"`,
  SOLUTION_HERO_BREADCRUMB.label,
  SOLUTION_PAGE_HERO_H1_CLASS,
  SOLUTION_PAGE_INTRO_CLASS,
  `href="${SIGNUP_PATH}"`,
  MARKETING_HERO_CTA_TEXT,
] as const;

/** Above-the-fold pricing block on compare pages — same classes as `ComparePage`. */
export const COMPARE_PRICING_SECTION_CLASS = "container mx-auto max-w-4xl px-4 pb-16";
export const COMPARE_PRICING_CARD_CLASS =
  "rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-8";
export const COMPARE_PRICING_H2_CLASS =
  "font-headline text-2xl font-bold text-foreground text-balance sm:text-3xl";
export const COMPARE_PRICING_SUMMARY_CLASS =
  "mt-4 max-w-3xl text-muted-foreground leading-relaxed text-pretty";

/** Substrings every compare-detail prerender hero must include (parity with `ComparePage`). */
export const COMPARE_HERO_PARITY_MARKERS = [
  `href="${COMPARE_HERO_BREADCRUMB.href}"`,
  COMPARE_HERO_BREADCRUMB.label,
  SOLUTION_PAGE_HERO_H1_CLASS,
  `href="${SIGNUP_PATH}"`,
  MARKETING_HERO_CTA_TEXT,
] as const;

export const COMPARE_PRICING_PARITY_MARKERS = [
  COMPARE_PRICING_SECTION_CLASS,
  COMPARE_PRICING_CARD_CLASS,
  COMPARE_PRICING_H2_CLASS,
  COMPARE_PRICING_SUMMARY_CLASS,
] as const;

/** Tailwind-aligned geometry for solution-style marketing heroes. */
export const SOLUTION_MARKETING_HERO_GEOMETRY = {
  containerMaxWidthRem: 64,
  containerPaddingXRem: 1,
  paddingTopRem: 3,
  paddingBottomRem: 3,
  paddingTopMdRem: 5,
  paddingBottomMdRem: 5,
  mdBreakpointPx: 768,
  h1: {
    baseFontSizeRem: 2.25,
    baseLineHeightRem: 2.5,
    mdFontSizeRem: 3,
    mdLineHeight: 1,
    maxWidthRem: 48,
    marginBottomRem: 2,
  },
  intro: {
    fontSizeRem: 1.125,
    lineHeight: 1.625,
    maxWidthRem: 48,
    marginBottomRem: 2,
  },
  cta: {
    heightRem: 3,
    paddingXRem: 1.5,
    fontSizeRem: 1,
    marginBottomRem: 3,
  },
  comparePricing: {
    h2FontSizeRem: 1.5,
    h2MdFontSizeRem: 1.875,
    h2LineHeight: 1.2,
    summaryFontSizeRem: 1,
    summaryLineHeight: 1.625,
    summaryMaxWidthRem: 48,
    summaryMarginTopRem: 1,
  },
  foregroundColor: "hsl(207 22% 10%)",
  mutedForegroundColor: "hsl(208 9% 37%)",
  primaryColor: "hsl(216 90% 38%)",
  primaryForegroundColor: "hsl(0 0% 100%)",
} as const;

const HEADLINE_FONT = "/fonts/barlow-semi-condensed-latin-700-normal.woff2";
const g = SOLUTION_MARKETING_HERO_GEOMETRY;

export const SOLUTION_MARKETING_HERO_CRITICAL_CSS = `
@font-face{font-family:"Barlow Semi Condensed";font-style:normal;font-weight:700;font-display:swap;src:url("${HEADLINE_FONT}") format("woff2")}
.prerender-marketing-hero{padding:${g.paddingTopRem}rem 0 ${g.paddingBottomRem}rem;overflow:hidden;color:${g.foregroundColor}}
@media (min-width:${g.mdBreakpointPx}px){.prerender-marketing-hero{padding-top:${g.paddingTopMdRem}rem;padding-bottom:${g.paddingBottomMdRem}rem}}
.prerender-marketing-hero-inner{max-width:${g.containerMaxWidthRem}rem;margin:0 auto;padding:0 ${g.containerPaddingXRem}rem}
.prerender-marketing-hero nav{font-size:0.875rem;line-height:1.25rem;margin-bottom:1.5rem;color:${g.mutedForegroundColor}}
.prerender-marketing-hero nav a{color:inherit;text-decoration:none}
.prerender-marketing-hero nav .text-foreground{color:${g.foregroundColor}}
.prerender-marketing-hero h1{font-family:"Barlow Semi Condensed",system-ui,sans-serif;font-size:${g.h1.baseFontSizeRem}rem;font-weight:700;line-height:${g.h1.baseLineHeightRem}rem;letter-spacing:0;margin:0 0 ${g.h1.marginBottomRem}rem;max-width:${g.h1.maxWidthRem}rem;color:${g.foregroundColor}}
@media (min-width:${g.mdBreakpointPx}px){.prerender-marketing-hero h1{font-size:${g.h1.mdFontSizeRem}rem;line-height:${g.h1.mdLineHeight}}}
.prerender-marketing-hero-inner > p{margin:0 0 ${g.intro.marginBottomRem}rem;max-width:${g.intro.maxWidthRem}rem;font-family:Barlow,system-ui,sans-serif;font-size:${g.intro.fontSizeRem}rem;line-height:${g.intro.lineHeight};color:${g.mutedForegroundColor}}
.prerender-marketing-hero-inner > .${MARKETING_HERO_CTA_WRAP_CLASS}{margin:0 0 ${g.cta.marginBottomRem}rem}
.prerender-marketing-hero-inner a[href="${SIGNUP_PATH}"]{display:inline-flex;align-items:center;justify-content:center;text-decoration:none;font-weight:600;height:${g.cta.heightRem}rem;padding:0 ${g.cta.paddingXRem}rem;font-size:${g.cta.fontSizeRem}rem;border-radius:0.375rem;background:${g.primaryColor};color:${g.primaryForegroundColor};box-shadow:0 1px 3px 0 rgb(0 0 0 / 0.1),0 1px 2px -1px rgb(0 0 0 / 0.1)}
main[data-prerender="static"]>section.container.mx-auto.max-w-4xl.pb-16 h2{font-family:"Barlow Semi Condensed",system-ui,sans-serif;font-size:${g.comparePricing.h2FontSizeRem}rem;font-weight:700;line-height:${g.comparePricing.h2LineHeight};margin:0;color:${g.foregroundColor}}
@media (min-width:${g.mdBreakpointPx}px){main[data-prerender="static"]>section.container.mx-auto.max-w-4xl.pb-16 h2{font-size:${g.comparePricing.h2MdFontSizeRem}rem}}
main[data-prerender="static"]>section.container.mx-auto.max-w-4xl.pb-16 p.text-pretty{margin:${g.comparePricing.summaryMarginTopRem}rem 0 0;max-width:${g.comparePricing.summaryMaxWidthRem}rem;font-family:Barlow,system-ui,sans-serif;font-size:${g.comparePricing.summaryFontSizeRem}rem;line-height:${g.comparePricing.summaryLineHeight};color:${g.mutedForegroundColor}}
.prerender-body{max-width:72rem;margin:0 auto;padding:2rem 1rem;font:16px/1.65 Barlow,system-ui,sans-serif;color:${g.foregroundColor}}
`.trim();

export function marketingDetailHeroVariant(path: string): "solution" | "compare" | null {
  if (/^\/solutions\/[^/]+$/.test(path)) return "solution";
  if (/^\/compare\/[^/]+$/.test(path)) return "compare";
  return null;
}

function buildMarketingBreadcrumb(
  parent: { href: string; label: string },
  currentLabel: string,
): string {
  return `<nav class="${MARKETING_BREADCRUMB_NAV_CLASS}">
          <a href="${parent.href}" class="${MARKETING_BREADCRUMB_LINK_CLASS}">${parent.label}</a>
          <span class="mx-2">/</span>
          <span class="text-foreground">${currentLabel}</span>
        </nav>`;
}

function buildMarketingHeroCta(): string {
  return `<div class="${MARKETING_HERO_CTA_WRAP_CLASS}">
          <a href="${SIGNUP_PATH}" class="${MARKETING_HERO_PRIMARY_CTA_LINK_CLASS}">${MARKETING_HERO_CTA_TEXT}</a>
        </div>`;
}

function buildComparePricingTableBlock(parts: { heading: string; summary: string }): string {
  return `<section class="${COMPARE_PRICING_SECTION_CLASS}">
          <div class="${COMPARE_PRICING_CARD_CLASS}">
            <h2 class="${COMPARE_PRICING_H2_CLASS}">${parts.heading}</h2>
            <p class="${COMPARE_PRICING_SUMMARY_CLASS}">${parts.summary}</p>
          </div>
        </section>`;
}

function buildMarketingHeroShell(heroInner: string, bodyHtml: string, aboveBodyHtml = ""): string {
  return `<main data-prerender="static">
      <style data-prerender="hero-critical">${SOLUTION_MARKETING_HERO_CRITICAL_CSS}</style>
      <section class="prerender-marketing-hero">
        <div class="prerender-marketing-hero-inner">
          ${heroInner}
        </div>
      </section>
      ${aboveBodyHtml}
      <div class="prerender-body">
      ${bodyHtml}
      </div>
    </main>`;
}

export function buildSolutionMarketingPrerenderShell(parts: {
  breadcrumbCurrent: string;
  heroH1: string;
  heroIntro: string;
  bodyHtml: string;
}): string {
  const heroInner = [
    buildMarketingBreadcrumb(SOLUTION_HERO_BREADCRUMB, parts.breadcrumbCurrent),
    `<h1 class="${SOLUTION_PAGE_HERO_H1_CLASS}">${parts.heroH1}</h1>`,
    `<p class="${SOLUTION_PAGE_INTRO_CLASS}">${parts.heroIntro}</p>`,
    buildMarketingHeroCta(),
  ].join("\n          ");

  return buildMarketingHeroShell(heroInner, parts.bodyHtml);
}

export function buildCompareMarketingPrerenderShell(parts: {
  breadcrumbCurrent: string;
  heroH1: string;
  bodyHtml: string;
  pricingTable?: { heading: string; summary: string };
}): string {
  const heroInner = [
    buildMarketingBreadcrumb(COMPARE_HERO_BREADCRUMB, parts.breadcrumbCurrent),
    `<h1 class="${SOLUTION_PAGE_HERO_H1_CLASS}">${parts.heroH1}</h1>`,
    buildMarketingHeroCta(),
  ].join("\n          ");

  const aboveBody = parts.pricingTable
    ? buildComparePricingTableBlock(parts.pricingTable)
    : "";

  return buildMarketingHeroShell(heroInner, parts.bodyHtml, aboveBody);
}

export function assertSolutionHeroParity(shellHtml: string): void {
  for (const marker of SOLUTION_HERO_PARITY_MARKERS) {
    if (!shellHtml.includes(marker)) {
      throw new Error(`solution hero missing parity marker: ${marker}`);
    }
  }
}

export function assertCompareHeroParity(shellHtml: string): void {
  for (const marker of COMPARE_HERO_PARITY_MARKERS) {
    if (!shellHtml.includes(marker)) {
      throw new Error(`compare hero missing parity marker: ${marker}`);
    }
  }
  const heroOnly = shellHtml.split('<div class="prerender-body">')[0] ?? "";
  if (heroOnly.includes(SOLUTION_PAGE_INTRO_CLASS)) {
    throw new Error("compare hero must not include solution intro classes");
  }
  if (shellHtml.includes(COMPARE_PRICING_SECTION_CLASS)) {
    for (const marker of COMPARE_PRICING_PARITY_MARKERS) {
      if (!shellHtml.includes(marker)) {
        throw new Error(`compare pricing block missing parity marker: ${marker}`);
      }
    }
  }
}