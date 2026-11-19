import { existsSync } from "node:fs";
import { join } from "node:path";
import type { BlogSsrPayload } from "../src/ssr/blogSsr";

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

export async function loadSsrRenderer(distDir: string): Promise<SsrRenderFn> {
  if (cachedRenderer) return cachedRenderer;
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

export function injectCrawlerOnlyDiscoveryNav(
  html: string,
  links: Array<{ href: string; label: string }>,
): string {
  if (!links.length) return html;
  const esc = (value: string) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  const items = links
    .map((link) => `<li><a href="${esc(link.href)}">${esc(link.label)}</a></li>`)
    .join("");
  const nav = `<nav data-crawler-discovery="true" aria-hidden="true" style="position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0"><ul>${items}</ul></nav>`;
  return html.replace("</body>", `    ${nav}\n  </body>`);
}

export function injectSsrDocument(options: {
  shell: string;
  routePath: string;
  indexable: boolean;
  appHtml: string;
  helmet: HelmetFragments;
  origin: string;
}): string {
  const { shell, routePath, indexable, appHtml, helmet, origin } = options;
  let html = stripDefaultHead(shell);
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
  return html;
}