import { describe, expect, it, vi } from "vitest";
import middleware from "../../../middleware";

describe("Vercel SEO middleware", () => {
  it("advertises agent resources and the Markdown alternate on HTML pages", () => {
    const response = middleware(new Request("https://maintenease.com/learn/cmms"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("link")).toContain("</api/ai.json>");
    expect(response.headers.get("link")).toContain("</learn/cmms.md>");
    expect(response.headers.get("vary")).toContain("Accept");
  });

  it("rewrites an explicit Markdown request to the generated representation", () => {
    vi.spyOn(console, "info").mockImplementation(() => undefined);
    const response = middleware(new Request("https://maintenease.com/learn/cmms", {
      headers: { Accept: "text/markdown" },
    }));

    expect(response.headers.get("x-middleware-rewrite")).toBe("https://maintenease.com/learn/cmms.md");
    expect(response.headers.get("content-type")).toContain("text/markdown");
    expect(response.headers.get("content-location")).toBe("/learn/cmms.md");
    expect(response.headers.get("link")).toContain('</learn/cmms>; rel="canonical"');
  });

  it("labels extensionless machine documents with their real media type", () => {
    const response = middleware(new Request("https://maintenease.com/.well-known/api-catalog"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("content-type")).toContain("application/linkset+json");
  });

  it("does not add indexable discovery headers to private routes", () => {
    const response = middleware(new Request("https://maintenease.com/auth?signup=true"));

    expect(response.headers.get("x-middleware-next")).toBe("1");
    expect(response.headers.get("link")).toBeNull();
  });
});
