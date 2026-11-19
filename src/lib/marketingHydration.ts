import { classifySeoPath, normalizeSeoPath } from "./seoRouting";

/** True when built HTML was emitted from React SSR and the client should hydrate. */
export function shouldHydrateMarketingPage(pathname: string, root: HTMLElement | null): boolean {
  if (!root) return false;
  if (root.getAttribute("data-ssr") !== "marketing") return false;
  if (!root.hasChildNodes()) return false;
  return classifySeoPath(normalizeSeoPath(pathname)) === "indexable";
}