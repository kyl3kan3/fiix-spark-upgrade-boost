/**
 * Calendar-month key helpers shared by the analytics libs. Pure, no imports.
 * Keys are computed in local time (matching how the dashboards bucket rows).
 */

/** Month key like "2026-03" for a date. */
export function monthKey(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

/** Continuous YYYY-MM keys for the last `n` calendar months, oldest first. */
export function lastNMonthKeys(n: number, ref: Date = new Date()): string[] {
  const keys: string[] = [];
  for (let i = n - 1; i >= 0; i--) {
    keys.push(monthKey(new Date(ref.getFullYear(), ref.getMonth() - i, 1)));
  }
  return keys;
}
