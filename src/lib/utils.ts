
import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Takes a CSS color variable name and returns both light/dark mode compatible classes
 * @param variable The CSS variable name without the hsl() wrapper
 * @returns A string with both light and dark mode compatible classes
 */
export function colorVariant(variable: string, opacity?: number) {
  const opacityValue = opacity !== undefined ? `/${opacity}` : '';
  return `hsl(var(--${variable})${opacityValue})`;
}

/**
 * Conditionally add dark mode classes
 * @param lightClass The class to use in light mode
 * @param darkClass The class to use in dark mode
 * @returns A combined string with conditional dark mode class
 */
export function darkMode(lightClass: string, darkClass: string) {
  return `${lightClass} dark:${darkClass}`;
}
