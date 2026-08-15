import { describe, expect, it } from "vitest";
import {
  acceptsMarkdown,
  appendVary,
  htmlPathForMarkdown,
  identifyCrawler,
  markdownPathForPage,
} from "@/lib/contentNegotiation";

describe("content negotiation", () => {
  it.each([
    "text/markdown",
    "text/html;q=0.5, text/markdown;q=1",
    "application/json, text/markdown; charset=utf-8",
  ])("accepts an explicit Markdown representation from %s", (header) => {
    expect(acceptsMarkdown(header)).toBe(true);
  });

  it.each([null, "", "text/html,*/*", "text/markdown;q=0", "text/plain"])(
    "does not negotiate Markdown for %s",
    (header) => {
      expect(acceptsMarkdown(header)).toBe(false);
    },
  );

  it("maps canonical pages to stable Markdown paths", () => {
    expect(markdownPathForPage("/")).toBe("/index.md");
    expect(markdownPathForPage("/solutions/work-order-software/")).toBe(
      "/solutions/work-order-software.md",
    );
    expect(markdownPathForPage("/robots.txt")).toBeNull();
    expect(htmlPathForMarkdown("/index.md")).toBe("/");
    expect(htmlPathForMarkdown("/learn/cmms.md")).toBe("/learn/cmms");
  });

  it("adds Accept to Vary once", () => {
    const headers = new Headers({ Vary: "Origin" });
    appendVary(headers, "Accept");
    appendVary(headers, "accept");
    expect(headers.get("Vary")).toBe("Origin, Accept");
  });

  it("classifies crawler user agents without retaining the raw value", () => {
    expect(identifyCrawler("Mozilla/5.0 (compatible; Googlebot/2.1)")).toBe("googlebot");
    expect(identifyCrawler("ChatGPT-User/1.0")).toBe("chatgpt-user");
    expect(identifyCrawler("Mozilla/5.0 Chrome/140")).toBeNull();
  });
});
