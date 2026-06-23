/**
 * Shared display formatters. Pure, no imports.
 */

/**
 * Locale-aware currency formatting. Whole amounts render without decimals;
 * fractional amounts show two. Falls back to "<CUR> <amount>" if the runtime
 * rejects the currency code.
 */
export function formatCurrency(amount: number, currency = "USD"): string {
  try {
    return new Intl.NumberFormat(undefined, {
      style: "currency",
      currency,
      maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    }).format(amount);
  } catch {
    return `${currency} ${amount.toFixed(2)}`;
  }
}
