import { classifySeoPath, normalizeSeoPath } from "./seoRouting";

export type InitialPrerender = { pathname: string; html: string };

export function captureInitialPrerender(document: Document, pathname: string): InitialPrerender | null {
  if (classifySeoPath(pathname) !== "indexable") return null;

  const content = document.querySelector('#root > main[data-prerender="static"]');
  if (!content) return null;

  return { pathname: normalizeSeoPath(pathname), html: content.outerHTML };
}

// Module evaluation happens before createRoot replaces the build-time HTML.
// Capture only our public page body, never private app shells or page scripts.
export const initialPrerender = typeof window === "undefined"
  ? null
  : captureInitialPrerender(document, window.location.pathname);
