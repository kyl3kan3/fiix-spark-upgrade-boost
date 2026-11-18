/**
 * Build-time and runtime share the same hero H1 classes so prerendered HTML
 * matches the hydrated Hero and LCP does not wait on React.
 *
 * Layout tokens mirror `Hero.tsx`: `pt-28 pb-16 md:pt-36 md:pb-24`,
 * `max-w-7xl px-4`, headline scale, and lead (`mt-6 max-w-xl text-lg leading-relaxed`).
 */
export const HOMEPAGE_HERO_H1_CLASS =
  "font-headline text-[2.75rem] font-bold leading-[1.02] text-white sm:text-6xl xl:text-7xl";

/** Tailwind-aligned geometry for prerender critical CSS ↔ React Hero. */
export const HOMEPAGE_HERO_GEOMETRY = {
  /** Matches `max-w-7xl` */
  containerMaxWidthRem: 80,
  /** Matches `px-4` on the hero container (only horizontal inset; not on the outer header). */
  containerPaddingXRem: 1,
  /** Matches `pt-28` */
  paddingTopRem: 7,
  /** Matches `pb-16` */
  paddingBottomRem: 4,
  /** Matches `md:pt-36` */
  paddingTopMdRem: 9,
  /** Matches `md:pb-24` */
  paddingBottomMdRem: 6,
  mdBreakpointPx: 768,
  /** Matches `mt-6` */
  leadMarginTopRem: 1.5,
  /** Matches `max-w-xl` */
  leadMaxWidthRem: 36,
  /** Matches `text-lg` */
  leadFontSizeRem: 1.125,
  /** Matches `leading-relaxed` */
  leadLineHeight: 1.625,
  h1: {
    /** Matches `text-[2.75rem]` */
    baseFontSizeRem: 2.75,
    /** Matches `leading-[1.02]` */
    baseLineHeight: 1.02,
    smBreakpointPx: 640,
    /** Matches `sm:text-6xl` */
    smFontSizeRem: 3.75,
    smLineHeight: 1,
    xlBreakpointPx: 1280,
    /** Matches `xl:text-7xl` */
    xlFontSizeRem: 4.5,
    xlLineHeight: 1,
  },
} as const;

const HERO_FONT = "/fonts/barlow-semi-condensed-latin-700-normal.woff2";

const g = HOMEPAGE_HERO_GEOMETRY;

/** Critical CSS for the homepage prerender hero (no Tailwind on static HTML). */
export const HOMEPAGE_HERO_CRITICAL_CSS = `
@font-face{font-family:"Barlow Semi Condensed";font-style:normal;font-weight:700;font-display:swap;src:url("${HERO_FONT}") format("woff2")}
.prerender-hero{background-color:hsl(207 22% 10%);color:#fff;padding:${g.paddingTopRem}rem 0 ${g.paddingBottomRem}rem;overflow:hidden}
@media (min-width:${g.mdBreakpointPx}px){.prerender-hero{padding-bottom:${g.paddingBottomMdRem}rem;padding-top:${g.paddingTopMdRem}rem}}
.prerender-hero-inner{max-width:${g.containerMaxWidthRem}rem;margin:0 auto;padding:0 ${g.containerPaddingXRem}rem}
.prerender-hero h1{font-family:"Barlow Semi Condensed",system-ui,sans-serif;font-size:${g.h1.baseFontSizeRem}rem;font-weight:700;line-height:${g.h1.baseLineHeight};margin:0;color:#fff}
@media (min-width:${g.h1.smBreakpointPx}px){.prerender-hero h1{font-size:${g.h1.smFontSizeRem}rem;line-height:${g.h1.smLineHeight}}
@media (min-width:${g.h1.xlBreakpointPx}px){.prerender-hero h1{font-size:${g.h1.xlFontSizeRem}rem;line-height:${g.h1.xlLineHeight}}
.prerender-hero-lead{margin-top:${g.leadMarginTopRem}rem;max-width:${g.leadMaxWidthRem}rem;font-size:${g.leadFontSizeRem}rem;line-height:${g.leadLineHeight};color:hsl(210 14% 80%)}
.prerender-body{max-width:72rem;margin:0 auto;padding:2rem 1rem;font:16px/1.65 system-ui,sans-serif;color:#172033}
`.trim();

export function buildHomepagePrerenderShell(parts: {
  heroH1: string;
  heroIntro: string;
  bodyHtml: string;
}): string {
  return `<main data-prerender="static">
      <style data-prerender="hero-critical">${HOMEPAGE_HERO_CRITICAL_CSS}</style>
      <header class="prerender-hero">
        <div class="prerender-hero-inner">
          <h1 class="${HOMEPAGE_HERO_H1_CLASS}">${parts.heroH1}</h1>
          <p class="prerender-hero-lead">${parts.heroIntro}</p>
        </div>
      </header>
      <div class="prerender-body">
      ${parts.bodyHtml}
      </div>
    </main>`;
}