import {
  extractTailwindRulesForClasses,
  tokenizeTailwindClasses,
} from "@/lib/extractTailwindCriticalCss";
import { HOMEPAGE_HERO_H1_CLASS, HOMEPAGE_HERO_LEAD_CLASS } from "@/lib/homepagePrerenderHero";
import {
  LEARN_ARTICLE_CONTAINER_CLASS,
  LEARN_ARTICLE_H1_CLASS,
  LEARN_ARTICLE_LEAD_CLASS,
} from "@/lib/learnPrerenderShell";
import {
  COMPARE_PRICING_CARD_CLASS,
  COMPARE_PRICING_H2_CLASS,
  COMPARE_PRICING_SECTION_CLASS,
  COMPARE_PRICING_SUMMARY_CLASS,
  MARKETING_BREADCRUMB_LINK_CLASS,
  MARKETING_BREADCRUMB_NAV_CLASS,
  MARKETING_HERO_CTA_WRAP_CLASS,
  MARKETING_HERO_PRIMARY_CTA_LINK_CLASS,
  SOLUTION_MARKETING_HERO_GEOMETRY,
  SOLUTION_PAGE_HERO_H1_CLASS,
  SOLUTION_PAGE_INTRO_CLASS,
} from "@/lib/marketingPrerenderShell";

const g = SOLUTION_MARKETING_HERO_GEOMETRY;

/** Single headline weight used above the fold — matches index.html font preload. */
export const HERO_HEADLINE_FONT_FACE =
  '@font-face{font-family:"Barlow Semi Condensed";font-style:normal;font-weight:700;font-display:swap;src:url("/fonts/barlow-semi-condensed-latin-700-normal.woff2") format("woff2")}';

const COMPARE_MARKETING_LAYOUT_CSS = `
.prerender-marketing-hero{padding:${g.paddingTopRem}rem 0 ${g.paddingBottomRem}rem;overflow:hidden;color:${g.foregroundColor}}
@media (min-width:${g.mdBreakpointPx}px){.prerender-marketing-hero{padding-top:${g.paddingTopMdRem}rem;padding-bottom:${g.paddingBottomMdRem}rem}}
.prerender-marketing-hero-inner{max-width:${g.containerMaxWidthRem}rem;margin:0 auto;padding:0 ${g.containerPaddingXRem}rem}
`.trim();

const HOMEPAGE_LAYOUT_CSS = `
.prerender-hero{background-color:hsl(207 22% 10%);color:#fff;padding:7rem 0 4rem;overflow:hidden}
@media (min-width:768px){.prerender-hero{padding-bottom:6rem;padding-top:9rem}}
.prerender-hero-inner{max-width:80rem;margin:0 auto;padding:0 1rem}
.prerender-body{max-width:72rem;margin:0 auto;padding:2rem 1rem;font:16px/1.65 system-ui,sans-serif;color:#172033}
`.trim();

const SOLUTION_ABOVE_FOLD_CLASSES = tokenizeTailwindClasses(
  SOLUTION_PAGE_HERO_H1_CLASS,
  SOLUTION_PAGE_INTRO_CLASS,
  MARKETING_BREADCRUMB_NAV_CLASS,
  MARKETING_BREADCRUMB_LINK_CLASS,
  MARKETING_HERO_CTA_WRAP_CLASS,
  MARKETING_HERO_PRIMARY_CTA_LINK_CLASS,
  "container mx-auto px-4 py-12 md:py-20 max-w-5xl",
  "mx-2",
  "text-foreground",
  "font-headline",
  "text-balance",
  "text-pretty",
  "hover:text-primary",
  "transition-colors",
  "bg-primary",
  "text-primary-foreground",
  "hover:bg-primary-variant",
  "font-semibold",
  "shadow-md",
);

const COMPARE_ABOVE_FOLD_EXTRA = tokenizeTailwindClasses(
  COMPARE_PRICING_SECTION_CLASS,
  COMPARE_PRICING_CARD_CLASS,
  COMPARE_PRICING_H2_CLASS,
  COMPARE_PRICING_SUMMARY_CLASS,
  "text-2xl",
  "sm:text-3xl",
  "sm:p-8",
  "p-5",
  "rounded-2xl",
  "border",
  "border-border",
  "bg-card",
  "mt-4",
);

const HOMEPAGE_CLASS_BUNDLE = tokenizeTailwindClasses(
  HOMEPAGE_HERO_H1_CLASS,
  HOMEPAGE_HERO_LEAD_CLASS,
  "font-headline",
  "font-bold",
  "text-white",
);

const LEARN_CLASS_BUNDLE = tokenizeTailwindClasses(
  LEARN_ARTICLE_CONTAINER_CLASS,
  LEARN_ARTICLE_H1_CLASS,
  LEARN_ARTICLE_LEAD_CLASS,
  MARKETING_BREADCRUMB_NAV_CLASS,
  MARKETING_BREADCRUMB_LINK_CLASS,
  "mx-2",
  "text-foreground",
  "font-bold",
  "text-balance",
  "text-pretty",
  "hover:text-primary",
  "transition-colors",
);

export function buildSolutionCriticalCss(compiledCss: string): string {
  const utilities = extractTailwindRulesForClasses(compiledCss, SOLUTION_ABOVE_FOLD_CLASSES);
  return [HERO_HEADLINE_FONT_FACE, utilities].filter(Boolean).join("\n");
}

export function buildCompareCriticalCss(compiledCss: string): string {
  const classes = [...new Set([...SOLUTION_ABOVE_FOLD_CLASSES, ...COMPARE_ABOVE_FOLD_EXTRA])];
  const utilities = extractTailwindRulesForClasses(compiledCss, classes);
  return [HERO_HEADLINE_FONT_FACE, COMPARE_MARKETING_LAYOUT_CSS, utilities].filter(Boolean).join("\n");
}

/** @deprecated Use buildSolutionCriticalCss or buildCompareCriticalCss */
export function buildMarketingDetailCriticalCss(compiledCss: string): string {
  return buildSolutionCriticalCss(compiledCss);
}

export function buildHomepageCriticalCss(compiledCss: string): string {
  const utilities = extractTailwindRulesForClasses(compiledCss, HOMEPAGE_CLASS_BUNDLE);
  return [HERO_HEADLINE_FONT_FACE, HOMEPAGE_LAYOUT_CSS, utilities].filter(Boolean).join("\n");
}

export function buildLearnCriticalCss(compiledCss: string): string {
  const utilities = extractTailwindRulesForClasses(compiledCss, LEARN_CLASS_BUNDLE);
  const layout = `.prerender-body{max-width:72rem;margin:0 auto;padding:2rem 1rem;font:16px/1.65 Barlow,system-ui,sans-serif;color:${g.foregroundColor}}`;
  return [HERO_HEADLINE_FONT_FACE, layout, utilities].filter(Boolean).join("\n");
}