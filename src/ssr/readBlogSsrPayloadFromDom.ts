import type { BlogSsrPayload } from "./blogSsr";

/** Blog rows serialized in prerendered HTML — must match SSR `BlogSsrProvider` value at hydration. */
export function readBlogSsrPayloadFromDom(): BlogSsrPayload | null {
  if (typeof document === "undefined") return null;
  const el = document.getElementById("blog-ssr-payload");
  if (!el?.textContent) return null;
  try {
    return JSON.parse(el.textContent) as BlogSsrPayload;
  } catch {
    return null;
  }
}