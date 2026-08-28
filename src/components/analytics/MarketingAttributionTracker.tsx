import { useEffect } from "react";
import { useLocation } from "react-router-dom";
import { classifySeoPath } from "@/lib/seoRouting";
import {
  buildPageViewDedupeKey,
  getAttributionMetadata,
  marketingPageSlugFromPath,
  readSignupAttribution,
  storeSignupAttribution,
  trackMarketingEvent,
} from "@/lib/analytics/marketingEvents";

function ctaLocationFor(element: Element): string {
  const explicit = element.closest<HTMLElement>("[data-cta-location]")?.dataset.ctaLocation;
  if (explicit) return explicit.slice(0, 120);
  const section = element.closest<HTMLElement>("section[id]")?.id;
  if (section) return section.slice(0, 120);
  if (element.closest("header, nav")) return "navigation";
  if (element.closest("footer")) return "footer";
  return "page-body";
}

export function MarketingAttributionTracker() {
  const location = useLocation();

  useEffect(() => {
    if (classifySeoPath(location.pathname) === "indexable") {
      const pageSlug = marketingPageSlugFromPath(location.pathname);
      void trackMarketingEvent({
        eventType: "page_view",
        pageSlug,
        metadata: { source_path: location.pathname, ...getAttributionMetadata() },
        dedupeKey: buildPageViewDedupeKey(pageSlug) ?? undefined,
      });
    }

    if (location.pathname === "/auth" && new URLSearchParams(location.search).get("signup") === "true") {
      const attribution = readSignupAttribution();
      const pageSlug = attribution?.sourcePageSlug ?? "direct";
      void trackMarketingEvent({
        eventType: "signup_start",
        pageSlug,
        metadata: attribution ? {
          source_path: attribution.sourcePath,
          cta_location: attribution.ctaLocation,
          captured_at: attribution.capturedAt,
          ...attribution.campaign,
        } : { source_path: "direct" },
        dedupeKey: `signup_start:${attribution?.sourcePath ?? "direct"}:session`,
      });
    }
  }, [location.pathname, location.search]);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      const target = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
      if (!target) return;

      let destination: URL;
      try {
        destination = new URL(target.href, window.location.href);
      } catch {
        return;
      }
      if (destination.origin !== window.location.origin) return;

      const pageSlug = marketingPageSlugFromPath(location.pathname);
      const ctaLocation = ctaLocationFor(target);
      const linkText = (target.textContent ?? "").trim().replace(/\s+/g, " ").slice(0, 120);
      const metadata = {
        source_path: location.pathname,
        target_path: destination.pathname,
        cta_location: ctaLocation,
        link_text: linkText,
        ...getAttributionMetadata(),
      };

      if (destination.pathname === "/auth" && destination.searchParams.get("signup") === "true") {
        storeSignupAttribution({
          sourcePageSlug: pageSlug,
          sourcePath: location.pathname + location.search,
          ctaLocation,
        });
        void trackMarketingEvent({ eventType: "trial_cta_click", pageSlug, metadata });
      } else if (destination.pathname === "/pricing") {
        void trackMarketingEvent({ eventType: "pricing_cta_click", pageSlug, metadata });
      } else if (destination.hash === "#talk-to-us") {
        void trackMarketingEvent({ eventType: "demo_cta_click", pageSlug, metadata });
      }
    };

    document.addEventListener("click", handleClick, true);
    return () => document.removeEventListener("click", handleClick, true);
  }, [location.pathname, location.search]);

  return null;
}
