/** Return only parsed, same-origin application paths. Reject browser URL normalization traps. */
export function safeAppPath(value: unknown): string | null {
  // eslint-disable-next-line no-control-regex -- Explicitly reject URL control characters and spreadsheet formula escapes.
  if (typeof value !== "string" || !value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u0020\u007f]/.test(value)) return null;
  try {
    const base = "https://app.invalid";
    const url = new URL(value, base);
    return url.origin === base && !url.pathname.startsWith("//") ? `${url.pathname}${url.search}${url.hash}` : null;
  } catch { return null; }
}

/** HTTP(S) links only; credentials and control characters have no legitimate use here. */
export function safeWebUrl(value: unknown): string | undefined {
  // eslint-disable-next-line no-control-regex -- Explicitly reject URL control characters and spreadsheet formula escapes.
  if (typeof value !== "string" || /[\u0000-\u0020\u007f]/.test(value)) return undefined;
  try {
    const url = new URL(value);
    return ["https:", "http:"].includes(url.protocol) && !url.username && !url.password ? url.href : undefined;
  } catch { return undefined; }
}

/** Quote every CSV cell and neutralize spreadsheet formula prefixes, including whitespace. */
export function csvCell(value: unknown): string {
  let text = String(value ?? "");
  // eslint-disable-next-line no-control-regex -- Explicitly reject URL control characters and spreadsheet formula escapes.
  if (/^[\s\u0000-\u001f]*[=+@-]/.test(text) || /^[\t\r\n]/.test(text)) text = "'" + text;
  return '"' + text.replace(/"/g, '""') + '"';
}
