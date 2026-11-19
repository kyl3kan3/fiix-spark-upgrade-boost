import { describe, expect, it } from "vitest";
import {
  COMPARE_PRICING_H2_CLASS,
  SOLUTION_MARKETING_HERO_CRITICAL_CSS,
  SOLUTION_MARKETING_HERO_GEOMETRY,
} from "@/lib/marketingPrerenderShell";
import { TAILWIND_FONT_SIZE, TAILWIND_SCREEN_SM_PX, tailwindClassSelector } from "@/lib/marketingCriticalCssUtils";

describe("compare pricing critical CSS ↔ Tailwind geometry", () => {
  const g = SOLUTION_MARKETING_HERO_GEOMETRY.comparePricing;
  const h2Selector = tailwindClassSelector(COMPARE_PRICING_H2_CLASS);

  it("uses text-2xl line-height (2rem) before sm, text-3xl at 640px", () => {
    expect(g.h2LineHeightRem).toBe(TAILWIND_FONT_SIZE["text-2xl"].lineHeightRem);
    expect(g.h2SmLineHeightRem).toBe(TAILWIND_FONT_SIZE["text-3xl"].lineHeightRem);
    expect(SOLUTION_MARKETING_HERO_CRITICAL_CSS).toContain(
      `${h2Selector}{font-family:"Barlow Semi Condensed",system-ui,sans-serif;font-size:${g.h2FontSizeRem}rem;font-weight:700;line-height:${g.h2LineHeightRem}rem`,
    );
    expect(SOLUTION_MARKETING_HERO_CRITICAL_CSS).toContain(
      `@media (min-width:${TAILWIND_SCREEN_SM_PX}px){${h2Selector}{font-size:${g.h2SmFontSizeRem}rem;line-height:${g.h2SmLineHeightRem}rem}}`,
    );
    expect(SOLUTION_MARKETING_HERO_CRITICAL_CSS).not.toContain(
      `@media (min-width:768px){${h2Selector}`,
    );
  });

  it("includes card border and padding geometry", () => {
    expect(SOLUTION_MARKETING_HERO_CRITICAL_CSS).toContain(`border:${g.cardBorderWidthPx}px solid`);
    expect(SOLUTION_MARKETING_HERO_CRITICAL_CSS).toContain(`padding:${g.cardPaddingRem}rem`);
    expect(SOLUTION_MARKETING_HERO_CRITICAL_CSS).toContain(
      `@media (min-width:${TAILWIND_SCREEN_SM_PX}px){`,
    );
    expect(SOLUTION_MARKETING_HERO_CRITICAL_CSS).toContain(`padding:${g.cardPaddingSmRem}rem`);
  });
});