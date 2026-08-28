import { next, rewrite } from "@vercel/functions";
import {
  acceptsMarkdown,
  appendVary,
  htmlPathForMarkdown,
  identifyCrawler,
  MARKDOWN_MEDIA_TYPE,
  markdownPathForPage,
} from "./src/lib/contentNegotiation";
import { classifySeoPath } from "./src/lib/seoRouting";

const AGENT_LINKS = [
  '</.well-known/api-catalog>; rel="api-catalog"; type="application/linkset+json"',
  '</llms.txt>; rel="service-doc"; type="text/plain"',
  '</api/ai.json>; rel="service-desc"; type="application/json"',
  '</api/blog.json>; rel="item"; type="application/json"',
  '</.well-known/mcp/server-card.json>; rel="mcp-server-card"; type="application/json"',
  '</.well-known/agent-skills/index.json>; rel="agent-skills"; type="application/json"',
  '</.well-known/oauth-protected-resource>; rel="oauth-protected-resource"; type="application/json"',
  '</.well-known/oauth-authorization-server>; rel="oauth-authorization-server"; type="application/json"',
  '</auth.md>; rel="author"; type="text/markdown"',
].join(", ");

const EXTENSIONLESS_MACHINE_TYPES: Record<string, string> = {
  "/.well-known/api-catalog": "application/linkset+json; charset=utf-8",
  "/.well-known/oauth-authorization-server": "application/json; charset=utf-8",
  "/.well-known/oauth-protected-resource": "application/json; charset=utf-8",
  "/.well-known/openid-configuration": "application/json; charset=utf-8",
};

function crawlerLog(request: Request, representation: "html" | "markdown" | "machine") {
  const crawler = identifyCrawler(request.headers.get("User-Agent"));
  if (!crawler && representation !== "markdown") return;

  const url = new URL(request.url);
  // Deliberate structured server log; raw user agents and IP addresses are excluded.
  // eslint-disable-next-line no-console
  console.info(JSON.stringify({
    event: "crawler_document_request",
    crawler: crawler ?? "markdown-client",
    method: request.method,
    path: url.pathname,
    representation,
  }));
}

export default function middleware(request: Request): Response {
  if (request.method !== "GET" && request.method !== "HEAD") return next();

  const url = new URL(request.url);
  const machineType = EXTENSIONLESS_MACHINE_TYPES[url.pathname];
  if (machineType) {
    crawlerLog(request, "machine");
    return next({
      headers: {
        "Content-Type": machineType,
        "Content-Disposition": "inline",
      },
    });
  }

  if (url.pathname === "/api/ai.json" || url.pathname === "/api/blog.json") {
    crawlerLog(request, "machine");
    return next({
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": "inline",
      },
    });
  }

  const explicitHtmlPath = htmlPathForMarkdown(url.pathname);
  if (explicitHtmlPath && classifySeoPath(explicitHtmlPath) === "indexable") {
    const headers = new Headers({
      "Content-Type": `${MARKDOWN_MEDIA_TYPE}; charset=utf-8`,
      "Content-Disposition": "inline",
      "Content-Location": url.pathname,
      Link: `<${explicitHtmlPath}>; rel="canonical"; type="text/html", ${AGENT_LINKS}`,
    });
    appendVary(headers, "Accept");
    crawlerLog(request, "markdown");
    return next({ headers });
  }

  if (classifySeoPath(url.pathname) !== "indexable") return next();

  const markdownPath = markdownPathForPage(url.pathname);
  if (markdownPath && acceptsMarkdown(request.headers.get("Accept"))) {
    const headers = new Headers({
      "Content-Type": `${MARKDOWN_MEDIA_TYPE}; charset=utf-8`,
      "Content-Disposition": "inline",
      "Content-Location": markdownPath,
      Link: `<${url.pathname}>; rel="canonical"; type="text/html", ${AGENT_LINKS}`,
    });
    appendVary(headers, "Accept");
    crawlerLog(request, "markdown");
    return rewrite(new URL(markdownPath, url.origin), { headers });
  }

  const headers = new Headers({ Link: AGENT_LINKS });
  if (markdownPath) {
    headers.append("Link", `<${markdownPath}>; rel="alternate"; type="${MARKDOWN_MEDIA_TYPE}"`);
    appendVary(headers, "Accept");
  }
  crawlerLog(request, "html");
  return next({ headers });
}
