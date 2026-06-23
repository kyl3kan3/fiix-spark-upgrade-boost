/**
 * Small numeric helpers shared across the analytics libs. Pure, no imports.
 */

/**
 * Round `n` to `decimalPlaces` digits. The `Number.EPSILON` nudge avoids the
 * classic float artifact where e.g. `Math.round(1.005 * 100) / 100` yields 1.00.
 */
export function round(n: number, decimalPlaces = 2): number {
  const f = 10 ** decimalPlaces;
  return Math.round((n + Number.EPSILON) * f) / f;
}
