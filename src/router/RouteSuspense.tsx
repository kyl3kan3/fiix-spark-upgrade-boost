import { Suspense, useCallback, useLayoutEffect, useRef, type ReactNode } from "react";
import { useLocation } from "react-router-dom";
import { LoaderCircle } from "lucide-react";
import { initialPrerender, type InitialPrerender } from "@/lib/initialPrerender";
import { normalizeSeoPath } from "@/lib/seoRouting";

function RouteReady({ onReady }: { onReady: () => void }) {
  useLayoutEffect(onReady, [onReady]);
  return null;
}

export function RouteSuspense({
  children,
  initialContent = initialPrerender,
}: {
  children: ReactNode;
  initialContent?: InitialPrerender | null;
}) {
  const { pathname } = useLocation();
  const retainedContent = useRef(initialContent);
  const discardInitialContent = useCallback(() => {
    retainedContent.current = null;
  }, []);
  const content = retainedContent.current;
  const showInitialContent = content?.pathname === normalizeSeoPath(pathname);
  useLayoutEffect(() => {
    if (retainedContent.current?.pathname !== normalizeSeoPath(pathname)) {
      discardInitialContent();
    }
  }, [pathname, discardInitialContent]);

  return (
    <Suspense fallback={showInitialContent ? (
      // This is the same build-generated HTML already in #root, not user input.
      // React replaces it once the lazy route commits; it is never duplicated.
      <div dangerouslySetInnerHTML={{ __html: content.html }} />
    ) : (
      <div className="flex min-h-[40vh] items-center justify-center" role="status">
        <LoaderCircle className="h-6 w-6 animate-spin text-primary" aria-hidden="true" />
        <span className="sr-only">Loading page</span>
      </div>
    )}>
      <RouteReady onReady={discardInitialContent} />
      {children}
    </Suspense>
  );
}
