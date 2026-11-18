/**
 * Build-time and runtime share the same hero H1 classes so prerendered HTML
 * matches the hydrated Hero and LCP does not wait on React.
 */
export const HOMEPAGE_HERO_H1_CLASS =
  "font-headline text-[2.75rem] font-bold leading-[1.02] text-white sm:text-6xl xl:text-7xl";

const HERO_FONT = "/fonts/barlow-semi-condensed-latin-700-normal.woff2";

/** Critical CSS for the homepage prerender hero (no Tailwind on static HTML). */
export const HOMEPAGE_HERO_CRITICAL_CSS = `
@font-face{font-family:"Barlow Semi Condensed";font-style:normal;font-weight:700;font-display:swap;src:url("${HERO_FONT}") format("woff2")}
.prerender-hero{background-color:hsl(207 22% 10%);color:#fff;padding:7rem 1rem 4rem;overflow:hidden}
@media (min-width:768px){.prerender-hero{padding-bottom:6rem;padding-top:9rem}}
.prerender-hero h1{font-family:"Barlow Semi Condensed",system-ui,sans-serif;font-size:2.75rem;font-weight:700;line-height:1.02;margin:0;color:#fff}
@media (min-width:640px){.prerender-hero h1{font-size:3.75rem;line-height:1}}
@media (min-width:1280px){.prerender-hero h1{font-size:4.5rem;line-height:1}}
.prerender-hero-lead{margin-top:1.5rem;max-width:36rem;font-size:1.125rem;line-height:1.625;color:hsl(210 14% 80%)}
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
        <div style="max-width:80rem;margin:0 auto;padding:0 1rem">
          <h1 class="${HOMEPAGE_HERO_H1_CLASS}">${parts.heroH1}</h1>
          <p class="prerender-hero-lead">${parts.heroIntro}</p>
        </div>
      </header>
      <div class="prerender-body">
      ${parts.bodyHtml}
      </div>
    </main>`;
}