import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";

const INLINE_LINK_PATTERN = /\[([^\]]+)\]\(([^)]+)\)/g;

export function renderInlineMarkdownLinks(text: string): ReactNode {
  const parts: ReactNode[] = [];
  let lastIndex = 0;
  for (const match of text.matchAll(INLINE_LINK_PATTERN)) {
    const index = match.index ?? 0;
    if (index > lastIndex) {
      parts.push(text.slice(lastIndex, index));
    }
    const href = match[2];
    const label = match[1];
    if (href.startsWith("/")) {
      parts.push(
        <Link
          key={`${index}-${href}`}
          to={href}
          className="font-medium text-primary underline underline-offset-2 hover:no-underline"
        >
          {label}
        </Link>,
      );
    } else {
      parts.push(
        <a
          key={`${index}-${href}`}
          href={href}
          className="font-medium text-primary underline underline-offset-2 hover:no-underline"
        >
          {label}
        </a>,
      );
    }
    lastIndex = index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  if (parts.length === 1) {
    return parts[0];
  }

  return parts.map((part, index) => (
    <Fragment key={index}>{part}</Fragment>
  ));
}
