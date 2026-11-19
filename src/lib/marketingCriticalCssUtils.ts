import { tailwindCompoundSelector } from "@/lib/extractTailwindCriticalCss";

/** Join Tailwind class strings into a compound selector with CSS.escape per class. */
export function tailwindClassSelector(classString: string): string {
  return tailwindCompoundSelector(classString);
}

/**
 * Default Tailwind v3 typography scale (theme.fontSize) used to keep prerender
 * critical CSS aligned with compiled utility output.
 */
export const TAILWIND_FONT_SIZE = {
  "text-2xl": { fontSizeRem: 1.5, lineHeightRem: 2 },
  "text-3xl": { fontSizeRem: 1.875, lineHeightRem: 2.25 },
  "text-lg": { fontSizeRem: 1.125, lineHeight: 1.625 },
  base: { fontSizeRem: 1, lineHeight: 1.5 },
} as const;

export const TAILWIND_SCREEN_SM_PX = 640;
export const TAILWIND_SCREEN_MD_PX = 768;