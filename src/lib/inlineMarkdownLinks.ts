const INLINE_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Root-relative single-segment paths only (`/path`, not `//host`). */
export function isSafeInlineLinkHref(href: string): boolean {
  const trimmed = href.trim();
  if (!trimmed) return false;
  if (trimmed.startsWith("//")) return false;
  if (/^\/(?!\/)/.test(trimmed)) return true;
  if (/^https:\/\//i.test(trimmed)) return true;
  return false;
}

export type InlineMarkdownLinkSegment =
  | { type: "text"; value: string }
  | { type: "link"; label: string; href: string };

export function parseInlineMarkdownLinks(text: string): InlineMarkdownLinkSegment[] {
  const segments: InlineMarkdownLinkSegment[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(INLINE_LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      segments.push({ type: "text", value: text.slice(lastIndex, index) });
    }
    const label = match[1];
    const href = match[2];
    if (isSafeInlineLinkHref(href)) {
      segments.push({ type: "link", label, href: href.trim() });
    } else {
      segments.push({ type: "text", value: match[0] });
    }
    lastIndex = index + match[0].length;
  }
  if (lastIndex < text.length) {
    segments.push({ type: "text", value: text.slice(lastIndex) });
  }
  if (segments.length === 0) {
    segments.push({ type: "text", value: text });
  }
  return segments;
}

export function inlineMarkdownLinksToHtml(text: string, esc: (value: string) => string): string {
  return parseInlineMarkdownLinks(text)
    .map((segment) => {
      if (segment.type === "text") return esc(segment.value);
      if (segment.href.startsWith("/")) {
        return `<a href="${esc(segment.href)}">${esc(segment.label)}</a>`;
      }
      return `<a href="${esc(segment.href)}" rel="noopener noreferrer">${esc(segment.label)}</a>`;
    })
    .join("");
}
