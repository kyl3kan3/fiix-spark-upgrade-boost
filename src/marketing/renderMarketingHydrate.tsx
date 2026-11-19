import { hydrateRoot } from "react-dom/client";
import type { FilledContext } from "react-helmet-async";
import { AppProviders } from "@/providers/AppProviders";
import { AppContent } from "@/AppContent";
import { readBlogSsrPayloadFromDom } from "@/ssr/readBlogSsrPayloadFromDom";

/** Hydrate a marketing SSR document (lazy-loaded from `main.tsx` so app entry stays lean). */
export function renderMarketingHydrate(rootEl: HTMLElement): void {
  const helmetContext = {} as FilledContext;
  hydrateRoot(
    rootEl,
    <AppProviders
      marketingHydrate
      ssr={{
        location: window.location.pathname,
        helmetContext,
        blog: readBlogSsrPayloadFromDom(),
      }}
    >
      <AppContent marketingHydratePhase />
    </AppProviders>,
  );
}