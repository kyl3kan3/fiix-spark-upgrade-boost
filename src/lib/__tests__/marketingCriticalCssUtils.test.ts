import { describe, expect, it } from "vitest";
import { tailwindClassSelector } from "@/lib/marketingCriticalCssUtils";
import {
  COMPARE_PRICING_CARD_CLASS,
  COMPARE_PRICING_H2_CLASS,
  SOLUTION_PAGE_HERO_H1_CLASS,
} from "@/lib/marketingPrerenderShell";

describe("tailwindClassSelector", () => {
  it("escapes variant colons for valid CSS", () => {
    const sel = tailwindClassSelector(SOLUTION_PAGE_HERO_H1_CLASS);
    expect(sel).toContain(".md\\:text-5xl");
    expect(sel).not.toMatch(/\.md:text-5xl(?![\w-])/);
  });

  it("escapes sm: breakpoint in compare pricing heading and card", () => {
    expect(tailwindClassSelector(COMPARE_PRICING_H2_CLASS)).toContain(".sm\\:text-3xl");
    expect(tailwindClassSelector(COMPARE_PRICING_CARD_CLASS)).toContain(".sm\\:p-8");
  });
});