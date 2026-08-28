#!/usr/bin/env node
import { randomUUID } from "node:crypto";

const base = (process.argv[2] || process.env.SEO_BASE_URL || "https://maintenease.com").replace(/\/$/, "");
const failures = [];
const pass = (message) => console.log(`✓ ${message}`);
const fail = (message) => { failures.push(message); console.error(`✗ ${message}`); };

async function request(path, redirect = "manual") {
  const response = await fetch(`${base}${path}`, {
    method: "GET",
    redirect,
    headers: { "User-Agent": "MaintenEase-SEO-live-regression/1.0" },
  });
  return { response, body: await response.text() };
}

const randomPath = `/seo-route-regression-${randomUUID()}`;
for (const path of [randomPath, "/blog/industrial-maintenance-optimization", "/learn/industrial-preventive-maintenance"]) {
  const { response } = await request(path);
  if (response.status !== 404) fail(`${path} returned ${response.status}; expected 404`);
  else if (!/noindex/i.test(response.headers.get("x-robots-tag") ?? "")) fail(`${path} is missing X-Robots-Tag: noindex`);
  else pass(`${path} is a true 404 with an HTTP noindex header`);
}

for (const path of ["/dashboard", "/assets/seo-regression-asset"]) {
  const { response, body } = await request(path);
  if (response.status !== 200) fail(`${path} returned ${response.status}; expected the app shell with 200`);
  else if (!/text\/html/i.test(response.headers.get("content-type") ?? "")) fail(`${path} has ${response.headers.get("content-type") ?? "no Content-Type"}; expected text/html`);
  else if (!/noindex\s*,?\s*nofollow/i.test(response.headers.get("x-robots-tag") ?? "")) fail(`${path} is missing X-Robots-Tag: noindex, nofollow`);
  else if (!/<meta name="robots" content="noindex,nofollow"/i.test(body)) fail(`${path} app shell is missing noindex,nofollow HTML metadata`);
  else pass(`${path} returns the protected noindex app shell`);
}

const negotiated = await fetch(`${base}/learn/cmms`, {
  method: "GET",
  redirect: "manual",
  headers: {
    Accept: "text/markdown",
    "User-Agent": "MaintenEase-SEO-live-regression/1.0",
  },
});
const negotiatedBody = await negotiated.text();
if (negotiated.status !== 200) fail(`/learn/cmms Markdown negotiation returned ${negotiated.status}`);
else if (!/text\/markdown/i.test(negotiated.headers.get("content-type") ?? "")) fail(`/learn/cmms Markdown negotiation has the wrong Content-Type`);
else if (!/^#\s+Maintenance Management Systems/m.test(negotiatedBody)) fail(`/learn/cmms Markdown negotiation returned the wrong representation`);
else if (!/accept/i.test(negotiated.headers.get("vary") ?? "")) fail(`/learn/cmms Markdown negotiation is missing Vary: Accept`);
else pass(`/learn/cmms serves its Markdown representation when explicitly requested`);

for (const [path, expectedType] of [
  ["/.well-known/api-catalog", "application/linkset+json"],
  ["/.well-known/oauth-authorization-server", "application/json"],
  ["/api/blog.json", "application/json"],
]) {
  const { response } = await request(path);
  if (response.status !== 200) fail(`${path} returned ${response.status}; expected 200`);
  else if (!(response.headers.get("content-type") ?? "").includes(expectedType)) fail(`${path} has the wrong Content-Type`);
  else pass(`${path} exposes the expected machine-readable media type`);
}

for (const path of ["/", "/pricing", "/learn/preventive-maintenance", "/tools/maintenance-sop-generator"]) {
  const { response, body } = await request(path);
  const ordinaryBody = body.replace(/<noscript[\s\S]*?<\/noscript>/gi, "");
  if (response.status !== 200) fail(`${path} returned ${response.status}; expected 200`);
  else if (/noindex/i.test(response.headers.get("x-robots-tag") ?? "")) fail(`${path} unexpectedly carries an HTTP noindex header`);
  else if (!/<link\b[^>]*rel="canonical"/i.test(body)) fail(`${path} is missing a canonical`);
  else if (!/<main[^>]+data-prerender="static"[\s\S]*?<h1[\s>]/i.test(ordinaryBody)) fail(`${path} lacks ordinary build-time HTML with an H1 outside noscript`);
  else pass(`${path} is 200, indexable, canonical, and meaningful without JavaScript`);
}

const redirects = [
  ["/privacy-policy", 301, "/privacy"],
  ["/login", 302, "/auth"],
  ["/blog/how-to-build-an-industrial-preventive-maintenance-plan-in-2026", 301, "/learn/preventive-maintenance"],
];
for (const [path, status, destination] of redirects) {
  const { response } = await request(path);
  const location = response.headers.get("location") ?? "";
  if (response.status !== status) fail(`${path} returned ${response.status}; expected ${status}`);
  else if (new URL(location, base).pathname !== destination) fail(`${path} redirects to ${location}; expected ${destination}`);
  else pass(`${path} preserves ${status} → ${destination}`);
}

const baseUrl = new URL(base);
if (baseUrl.hostname === "maintenease.com") {
  const wwwUrl = new URL(`${baseUrl.protocol}//www.${baseUrl.hostname}${randomPath}`);
  const response = await fetch(wwwUrl, {
    method: "GET",
    redirect: "manual",
    headers: { "User-Agent": "MaintenEase-SEO-live-regression/1.0" },
  });
  const location = response.headers.get("location") ?? "";
  const expected = new URL(randomPath, base);
  if (![301, 308].includes(response.status)) fail(`www returned ${response.status}; expected a permanent redirect`);
  else if (new URL(location, base).href !== expected.href) fail(`www redirects to ${location}; expected ${expected.href}`);
  else pass(`www preserves the path and permanently redirects to ${baseUrl.hostname}`);
}

if (failures.length) {
  console.error(`\n${failures.length} live routing regression(s) failed against ${base}`);
  process.exit(1);
}
console.log(`\nAll live SEO routing checks passed against ${base}`);
