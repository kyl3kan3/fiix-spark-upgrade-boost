import { useEffect } from "react";

/**
 * Sets `document.title` for the lifetime of the calling component and
 * restores the previous title on unmount. Use this instead of `<Helmet>`
 * for simple per-page titles.
 */
export function useDocumentTitle(title: string) {
  useEffect(() => {
    const previous = document.title;
    document.title = title;
    return () => {
      document.title = previous;
    };
  }, [title]);
}
