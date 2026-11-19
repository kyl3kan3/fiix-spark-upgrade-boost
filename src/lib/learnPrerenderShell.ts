import { MARKETING_BREADCRUMB_LINK_CLASS, MARKETING_BREADCRUMB_NAV_CLASS } from "@/lib/marketingPrerenderShell";

/** Shared with `LearnArticle` for prerender ↔ hydration geometry. */
export const LEARN_ARTICLE_CONTAINER_CLASS = "container mx-auto px-4 py-12 md:py-16 max-w-3xl";
export const LEARN_ARTICLE_H1_CLASS =
  "text-4xl md:text-5xl font-bold tracking-normal mb-4 text-balance";
export const LEARN_ARTICLE_LEAD_CLASS = "text-xl text-foreground text-pretty";

export const LEARN_ARTICLE_PARITY_MARKERS = [
  LEARN_ARTICLE_CONTAINER_CLASS,
  LEARN_ARTICLE_H1_CLASS,
  LEARN_ARTICLE_LEAD_CLASS,
  MARKETING_BREADCRUMB_NAV_CLASS,
] as const;

export function learnDetailHeroVariant(path: string): boolean {
  return /^\/learn\/[^/]+$/.test(path);
}

export function buildLearnArticlePrerenderShell(parts: {
  breadcrumbCurrent: string;
  heroH1: string;
  heroIntro: string;
  bodyHtml: string;
}): string {
  const breadcrumb = `<nav class="${MARKETING_BREADCRUMB_NAV_CLASS}">
          <a href="/learn" class="${MARKETING_BREADCRUMB_LINK_CLASS}">Learn</a>
          <span class="mx-2">/</span>
          <span class="text-foreground">${parts.breadcrumbCurrent}</span>
        </nav>`;

  return `<main data-prerender="static">
      <article class="${LEARN_ARTICLE_CONTAINER_CLASS}">
        ${breadcrumb}
        <h1 class="${LEARN_ARTICLE_H1_CLASS}">${parts.heroH1}</h1>
        <p class="${LEARN_ARTICLE_LEAD_CLASS}">${parts.heroIntro}</p>
        <div class="prerender-body">
        ${parts.bodyHtml}
        </div>
      </article>
    </main>`;
}