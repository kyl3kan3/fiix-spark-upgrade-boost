/** Minimal solution fields inlined in prerender HTML for sync hero + meta without bundling the full catalog. */
export type SolutionRoutePayload = {
  slug: string;
  name: string;
  h1: string;
  intro: string;
  metaTitle: string;
  metaDescription: string;
  faqs: { q: string; a: string }[];
};

const PAYLOAD_ELEMENT_ID = "solution-route-payload";

export function readSolutionRoutePayload(): SolutionRoutePayload | null {
  if (typeof document === "undefined") return null;
  const el = document.getElementById(PAYLOAD_ELEMENT_ID);
  if (!el?.textContent?.trim()) return null;
  try {
    return JSON.parse(el.textContent) as SolutionRoutePayload;
  } catch {
    return null;
  }
}

export { PAYLOAD_ELEMENT_ID as SOLUTION_ROUTE_PAYLOAD_ELEMENT_ID };