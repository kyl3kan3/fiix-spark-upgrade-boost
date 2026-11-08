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
