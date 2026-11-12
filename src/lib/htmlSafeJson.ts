/**
 * Serialize JSON for embedding in HTML <script> tags without breaking out of
 * the script context or introducing XSS via "</script>" in string values.
 */
export function stringifyJsonLdForHtml(value: unknown): string {
  return JSON.stringify(value)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function jsonLdScriptTag(block: unknown, extraAttrs = ""): string {
  return `<script type="application/ld+json"${extraAttrs}>${stringifyJsonLdForHtml(block)}</script>`;
}
