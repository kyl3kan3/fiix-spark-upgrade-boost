/**
 * Build-time and runtime share the same hero H1 classes so prerendered HTML
 * matches the hydrated Hero and LCP does not wait on React.
 *
 * Layout tokens mirror `Hero.tsx`: `pt-28 pb-16 md:pt-36 md:pb-24`,
 * `max-w-7xl px-4`, headline scale, and lead (`mt-6 max-w-xl text-lg leading-relaxed`).
 */
export const HOMEPAGE_HERO_H1_CLASS =
  "font-headline text-[2.75rem] font-bold leading-[1.02] text-white sm:text-6xl xl:text-7xl";

/** Same classes as the lead paragraph in `Hero.tsx`. */
export const HOMEPAGE_HERO_LEAD_CLASS =
  "mt-6 max-w-xl text-lg leading-relaxed text-sidebar-foreground";

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

export function buildHomepagePrerenderShell(parts: {
  heroH1: string;
  heroIntro: string;
  bodyHtml: string;
}): string {
  return `<main data-prerender="static">
      <header class="prerender-hero">
        <div class="prerender-hero-inner">
          <h1 class="${HOMEPAGE_HERO_H1_CLASS}">${parts.heroH1}</h1>
          <p class="${HOMEPAGE_HERO_LEAD_CLASS}">${parts.heroIntro}</p>
        </div>
      </header>
      <div class="prerender-body">
      ${parts.bodyHtml}
      </div>
    </main>`;
}