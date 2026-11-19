import { classifySeoPath, normalizeSeoPath } from "./seoRouting";

/** Prerendered marketing HTML includes this on `#root`. */
export function isMarketingSsrDocument(root: HTMLElement | null = document.getElementById("root")): boolean {
  return root?.getAttribute("data-ssr") === "marketing";
}

/** True when built HTML was emitted from React SSR and the client should hydrate. */
export function shouldHydrateMarketingPage(pathname: string, root: HTMLElement | null): boolean {
  if (!root) return false;
  if (root.getAttribute("data-ssr") !== "marketing") return false;
  if (!root.hasChildNodes()) return false;
  return classifySeoPath(normalizeSeoPath(pathname)) === "indexable";
}