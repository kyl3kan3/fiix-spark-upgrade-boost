/**
 * Critical CSS + HTML shell for marketing detail pages (solutions, comparisons)
 * so LCP (usually the intro paragraph) paints at final size before React hydrates.
 *
 * Layout tokens mirror `SolutionPage.tsx` and `ComparePage.tsx` heroes:
 * `container max-w-5xl px-4 py-12 md:py-20`, headline, and intro typography.
 */
export const SOLUTION_PAGE_HERO_H1_CLASS =
  "font-headline text-4xl md:text-5xl font-bold tracking-normal mb-8 max-w-3xl text-foreground";

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
    /** Matches Tailwind `text-4xl` (`line-height: 2.5rem`, not unitless 2.5). */
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
  foregroundColor: "hsl(207 22% 10%)",
  mutedForegroundColor: "hsl(208 9% 37%)",
} as const;

const HEADLINE_FONT = "/fonts/barlow-semi-condensed-latin-700-normal.woff2";
const g = SOLUTION_MARKETING_HERO_GEOMETRY;

export const SOLUTION_MARKETING_HERO_CRITICAL_CSS = `
@font-face{font-family:"Barlow Semi Condensed";font-style:normal;font-weight:700;font-display:swap;src:url("${HEADLINE_FONT}") format("woff2")}
.prerender-marketing-hero{padding:${g.paddingTopRem}rem 0 ${g.paddingBottomRem}rem;overflow:hidden;color:${g.foregroundColor}}
@media (min-width:${g.mdBreakpointPx}px){.prerender-marketing-hero{padding-top:${g.paddingTopMdRem}rem;padding-bottom:${g.paddingBottomMdRem}rem}}
.prerender-marketing-hero-inner{max-width:${g.containerMaxWidthRem}rem;margin:0 auto;padding:0 ${g.containerPaddingXRem}rem}
.prerender-marketing-hero h1{font-family:"Barlow Semi Condensed",system-ui,sans-serif;font-size:${g.h1.baseFontSizeRem}rem;font-weight:700;line-height:${g.h1.baseLineHeightRem}rem;letter-spacing:0;margin:0 0 ${g.h1.marginBottomRem}rem;max-width:${g.h1.maxWidthRem}rem;color:${g.foregroundColor}}
@media (min-width:${g.mdBreakpointPx}px){.prerender-marketing-hero h1{font-size:${g.h1.mdFontSizeRem}rem;line-height:${g.h1.mdLineHeight}}}
.prerender-marketing-intro{margin:0 0 ${g.intro.marginBottomRem}rem;max-width:${g.intro.maxWidthRem}rem;font-family:Barlow,system-ui,sans-serif;font-size:${g.intro.fontSizeRem}rem;line-height:${g.intro.lineHeight};color:${g.mutedForegroundColor}}
.prerender-body{max-width:72rem;margin:0 auto;padding:2rem 1rem;font:16px/1.65 Barlow,system-ui,sans-serif;color:${g.foregroundColor}}
`.trim();

/** Solution detail and compare detail routes share this hero layout. */
export function marketingDetailHeroVariant(path: string): "solution" | null {
  if (/^\/solutions\/[^/]+$/.test(path)) return "solution";
  if (/^\/compare\/[^/]+$/.test(path)) return "solution";
  return null;
}

export function buildSolutionMarketingPrerenderShell(parts: {
  heroH1: string;
  heroIntro: string;
  bodyHtml: string;
}): string {
  return `<main data-prerender="static">
      <style data-prerender="hero-critical">${SOLUTION_MARKETING_HERO_CRITICAL_CSS}</style>
      <section class="prerender-marketing-hero">
        <div class="prerender-marketing-hero-inner">
          <h1 class="${SOLUTION_PAGE_HERO_H1_CLASS}">${parts.heroH1}</h1>
          <p class="prerender-marketing-intro">${parts.heroIntro}</p>
        </div>
      </section>
      <div class="prerender-body">
      ${parts.bodyHtml}
      </div>
    </main>`;
}