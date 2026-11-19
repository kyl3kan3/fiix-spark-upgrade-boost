import { existsSync } from "node:fs";
import { join } from "node:path";
import type { BlogSsrPayload } from "../src/ssr/blogSsr";
import { buildHomepageSsrHeadBoost } from "../src/lib/homepagePrerenderHero";

type HelmetFragments = {
  title: { toString(): string };
  meta: { toString(): string };
  link: { toString(): string };
  script: { toString(): string };
};

export type SsrRenderFn = (
  pathname: string,
  options?: { blog?: BlogSsrPayload | null },
) => Promise<{ html: string; helmet: HelmetFragments }>;

let cachedRenderer: SsrRenderFn | null = null;

/** Supabase realtime needs WebSocket; Node 20 in CI has no native global. */
async function ensureNodeWebSocket(): Promise<void> {
  if (typeof globalThis.WebSocket !== "undefined") return;
  const { default: ws } = await import("ws");
  globalThis.WebSocket = ws as unknown as typeof WebSocket;
}

export async function loadSsrRenderer(distDir: string): Promise<SsrRenderFn> {
  if (cachedRenderer) return cachedRenderer;
  await ensureNodeWebSocket();
  const entry = join(distDir, "server", "entry-server.js");
  if (!existsSync(entry)) {
    throw new Error(
      `Missing ${entry}. Run vite build --ssr src/entry-server.tsx --outDir dist/server before prerender.`,
    );
  }
  const mod = (await import(entry)) as { render: SsrRenderFn };
  if (typeof mod.render !== "function") {
    throw new Error("SSR entry-server.js does not export render()");
  }
  cachedRenderer = mod.render;
  return cachedRenderer;
}

export function stripDefaultHead(html: string): string {
  let out = html;
  out = out.replace(/<title>[\s\S]*?<\/title>\s*/i, "");
  out = out.replace(/<meta name="description"[^>]*>\s*/gi, "");
  out = out.replace(/<meta name="robots"[^>]*>\s*/gi, "");
  out = out.replace(/<link[^>]*rel="canonical"[^>]*>\s*/gi, "");
  out = out.replace(/<meta property="og:(?:type|title|description|url|image[^"]*)"[^>]*>\s*/gi, "");
  out = out.replace(/<meta name="twitter:(?:card|title|description|image[^"]*)"[^>]*>\s*/gi, "");
  out = out.replace(
    /<script type="application\/ld\+json" data-ld-home="[^"]*">[\s\S]*?<\/script>\s*/gi,
    "",
  );
  return out;
}

function serializeBlogSsrPayload(payload: unknown): string {
  return JSON.stringify(payload).replace(/</g, "\\u003c");
}

export function injectSsrDocument(options: {
  shell: string;
  routePath: string;
  indexable: boolean;
  appHtml: string;
  helmet: HelmetFragments;
  origin: string;
  blogSsrPayload?: unknown;
}): string {
  const { shell, routePath, indexable, appHtml, helmet, origin, blogSsrPayload } = options;
  let html = stripDefaultHead(shell);
  if (routePath === "/") {
    const stylesheetHref = html.match(/<link rel="stylesheet"[^>]+href="([^"]+)"/)?.[1];
    html = html.replace(
      /<head>/i,
      `<head>\n    ${buildHomepageSsrHeadBoost(stylesheetHref)}\n`,
    );
  }
  const headParts = [
    helmet.title.toString(),
    helmet.meta.toString(),
    helmet.link.toString(),
    helmet.script.toString(),
  ].filter((part) => part.trim().length > 0);
  if (
    indexable &&
    !headParts.some((part) => part.includes('rel="alternate"') && part.includes("text/markdown"))
  ) {
    const markdownHref =
      routePath === "/"
        ? `${origin}/index.md`
        : `${origin}${routePath}.md`;
    headParts.push(`<link rel="alternate" type="text/markdown" href="${markdownHref}" />`);
  }
  html = html.replace("</head>", `  ${headParts.join("\n    ")}\n  </head>`);
  const rootPattern = /<div id="root"[^>]*>\s*<\/div>/;
  if (!rootPattern.test(html)) {
    throw new Error(`Shell HTML is missing an empty #root container (${routePath})`);
  }
  html = html.replace(
    rootPattern,
    `<div id="root" data-ssr="marketing">${appHtml}</div>`,
  );
  if (blogSsrPayload != null && Object.keys(blogSsrPayload as object).length > 0) {
    const script = `<script type="application/json" id="blog-ssr-payload">${serializeBlogSsrPayload(blogSsrPayload)}</script>`;
    html = html.replace("</body>", `    ${script}\n  </body>`);
  }
  return html;
}