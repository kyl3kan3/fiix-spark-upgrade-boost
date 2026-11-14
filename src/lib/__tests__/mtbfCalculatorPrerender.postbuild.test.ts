import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";
import { jsonLdTypes } from "@/data/mtbfCalculatorJsonLd";
import { jsonLdScriptTag, stringifyJsonLdForHtml } from "../htmlSafeJson";

type JsonLdNode = { "@type"?: string | string[] };

function collectJsonLdNodes(parsed: unknown): JsonLdNode[] {
  const nodes: JsonLdNode[] = [];

  const visit = (value: unknown) => {
    if (value == null) return;
    if (Array.isArray(value)) {
      value.forEach(visit);
      return;
    }
    if (typeof value !== "object") return;

    const obj = value as Record<string, unknown> & JsonLdNode;
    if ("@type" in obj) nodes.push(obj);

    const graph = obj["@graph"];
    if (Array.isArray(graph)) graph.forEach(visit);
  };

  visit(parsed);
  return nodes;
}

function allJsonLdNodesFromHtml(html: string): JsonLdNode[] {
  const nodes: JsonLdNode[] = [];
  for (const match of html.matchAll(
    /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi,
  )) {
    try {
      nodes.push(...collectJsonLdNodes(JSON.parse(match[1]) as unknown));
    } catch {
      // ignore invalid blocks
    }
  }
  return nodes;
}

function countNodesWithType(html: string, type: string): number {
  return allJsonLdNodesFromHtml(html).filter((node) => jsonLdTypes(node).includes(type)).length;
}

describe("built /tools/mtbf-calculator prerender", () => {
  const distIndex = resolve(process.cwd(), "dist/tools/mtbf-calculator/index.html");

  it("ships exactly one SoftwareApplication-type JSON-LD node and one FAQPage node", () => {
    expect(existsSync(distIndex), "dist/tools/mtbf-calculator/index.html missing — run npm run build").toBe(true);
    const html = readFileSync(distIndex, "utf8");
    expect(countNodesWithType(html, "SoftwareApplication")).toBe(1);
    expect(countNodesWithType(html, "FAQPage")).toBe(1);
  });

  it("serializes prerender JSON-LD without script-breakout or HTML-comment injection", () => {
    const payload = {
      text: `</script><script>alert(1)</script>`,
      comment: "<!--",
      lineSep: "a\u2028b",
      paraSep: "c\u2029d",
    };

    const serialized = stringifyJsonLdForHtml(payload);
    expect(serialized).not.toMatch(/<\/script/i);
    expect(serialized).not.toContain("<!--");
    expect(JSON.parse(serialized)).toEqual(payload);

    const tag = jsonLdScriptTag(payload);
    const inner = tag.replace(/^<script[^>]*>/, "").replace(/<\/script>\s*$/, "");
    expect(inner).not.toMatch(/<\/script/i);
    expect(inner).not.toContain("<!--");
    expect(JSON.parse(inner)).toEqual(payload);
  });
});