import {
  createContext,
  useCallback,
  useContext,
  useLayoutEffect,
  useState,
  type ReactNode,
} from "react";
import { useLocation } from "react-router-dom";
import { initialPrerender } from "@/lib/initialPrerender";
import { classifySeoPath, normalizeSeoPath } from "@/lib/seoRouting";

type OverlayContextValue = { dismissAfterPaint: () => void };

const MarketingOverlayContext = createContext<OverlayContextValue | null>(null);

export function useMarketingPrerenderOverlay(): OverlayContextValue {
  const ctx = useContext(MarketingOverlayContext);
  return ctx ?? { dismissAfterPaint: () => {} };
}

/**
 * Keeps build-time marketing HTML visible through the first React paint so LCP
 * does not jump to a later-hydrated duplicate node. Dismissed after the route
 * commits (see RouteSuspense).
 */
export function MarketingPrerenderOverlay({ children }: { children: ReactNode }) {
  const { pathname } = useLocation();
  const initial = initialPrerender;
  const indexable = classifySeoPath(pathname) === "indexable";
  const pathMatch = indexable && initial?.pathname === normalizeSeoPath(pathname);
  const [visible, setVisible] = useState(() => pathMatch && Boolean(initial?.html));

  useLayoutEffect(() => {
    if (!pathMatch) setVisible(false);
  }, [pathMatch]);

  const dismissAfterPaint = useCallback(() => {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setVisible(false));
    });
  }, []);

  return (
    <MarketingOverlayContext.Provider value={{ dismissAfterPaint }}>
      {visible && initial?.html ? (
        <div
          data-marketing-prerender-overlay
          className="marketing-prerender-overlay"
          // Captured at module init from build-time #root markup (not user input).
          dangerouslySetInnerHTML={{ __html: initial.html }}
        />
      ) : null}
      {children}
    </MarketingOverlayContext.Provider>
  );
}