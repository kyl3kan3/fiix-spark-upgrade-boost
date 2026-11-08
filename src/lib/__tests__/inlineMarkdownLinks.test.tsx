import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import {
  inlineMarkdownLinksToHtml,
  isSafeInlineLinkHref,
  parseInlineMarkdownLinks,
} from "@/lib/inlineMarkdownLinks";
import { renderInlineMarkdownLinks } from "@/lib/renderInlineMarkdownLinks";

const esc = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;");

describe("inlineMarkdownLinks", () => {
  it("accepts only single-slash root-relative and https destinations", () => {
    expect(isSafeInlineLinkHref("/learn/work-order")).toBe(true);
    expect(isSafeInlineLinkHref("https://maintenease.com/learn/work-order")).toBe(true);
    expect(isSafeInlineLinkHref("//evil.example")).toBe(false);
    expect(isSafeInlineLinkHref("javascript:alert(1)")).toBe(false);
    expect(isSafeInlineLinkHref("data:text/html,test")).toBe(false);
    expect(isSafeInlineLinkHref("http://example.com")).toBe(false);
    expect(isSafeInlineLinkHref("/\\evil.example")).toBe(false);
    expect(isSafeInlineLinkHref("/learn\\foo")).toBe(false);
    expect(isSafeInlineLinkHref("/learn\t/foo")).toBe(false);
    expect(isSafeInlineLinkHref("/learn\n/evil")).toBe(false);
    expect(isSafeInlineLinkHref("https://maintenease.com/\\evil")).toBe(false);
  });

  it("rejects authority-smuggling paths in React and static HTML", () => {
    const malicious = String.raw`[trap](/\evil.example) and [tab](/learn` + "\t/evil)";
    const html = inlineMarkdownLinksToHtml(malicious, esc);
    expect(html).not.toMatch(/<a\s+href=/);
    expect(html).toContain(String.raw`[trap](/\evil.example)`);
    expect(html).toContain("[tab](/learn");

    const { queryByRole, container } = render(
      <MemoryRouter>{renderInlineMarkdownLinks(malicious)}</MemoryRouter>,
    );
    expect(queryByRole("link")).toBeNull();
    expect(container.textContent).toContain(String.raw`[trap](/\evil.example)`);
  });

  it("still linkifies known-safe paths in React and static HTML", () => {
    const safe = "See [work order](/learn/work-order) and [docs](https://maintenease.com/support).";
    const html = inlineMarkdownLinksToHtml(safe, esc);
    expect(html).toContain('<a href="/learn/work-order">work order</a>');
    expect(html).toContain('<a href="https://maintenease.com/support"');
    const { getAllByRole } = render(
      <MemoryRouter>{renderInlineMarkdownLinks(safe)}</MemoryRouter>,
    );
    expect(getAllByRole("link")).toHaveLength(2);
  });

  it("renders unsafe link targets as plain text", () => {
    const segments = parseInlineMarkdownLinks("See [x](javascript:alert) and [y](/learn/cmms).");
    expect(segments).toEqual([
      { type: "text", value: "See " },
      { type: "text", value: "[x](javascript:alert)" },
      { type: "text", value: " and " },
      { type: "link", label: "y", href: "/learn/cmms" },
      { type: "text", value: "." },
    ]);
    expect(inlineMarkdownLinksToHtml("Try [bad](//evil.test)", esc)).toBe("Try [bad](//evil.test)");
  });

  it("renders safe links in React", () => {
    const { getByRole, queryByRole, container } = render(
      <MemoryRouter>{renderInlineMarkdownLinks("Read [CMMS](/learn/cmms) or [bad](javascript:void(0)).")}</MemoryRouter>,
    );
    expect(getByRole("link", { name: "CMMS" })).toHaveAttribute("href", "/learn/cmms");
    expect(queryByRole("link", { name: "bad" })).toBeNull();
    expect(container.textContent).toContain("[bad](javascript:void(0))");
  });
});
