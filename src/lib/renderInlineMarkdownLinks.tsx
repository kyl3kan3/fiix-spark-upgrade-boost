import { Fragment, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { parseInlineMarkdownLinks } from "@/lib/inlineMarkdownLinks";

export function renderInlineMarkdownLinks(text: string): ReactNode {
  const segments = parseInlineMarkdownLinks(text);
  if (segments.length === 1 && segments[0].type === "text") {
    return segments[0].value;
  }

  return segments.map((segment, index) => {
    if (segment.type === "text") {
      return <Fragment key={index}>{segment.value}</Fragment>;
    }
    if (segment.href.startsWith("/")) {
      return (
        <Link
          key={`${index}-${segment.href}`}
          to={segment.href}
          className="font-medium text-primary underline underline-offset-2 hover:no-underline"
        >
          {segment.label}
        </Link>
      );
    }
    return (
      <a
        key={`${index}-${segment.href}`}
        href={segment.href}
        rel="noopener noreferrer"
        className="font-medium text-primary underline underline-offset-2 hover:no-underline"
      >
        {segment.label}
      </a>
    );
  });
}
