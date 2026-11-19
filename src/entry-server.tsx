import React from "react";
import { renderToString } from "react-dom/server";
import type { FilledContext } from "react-helmet-async";
import { AppContent } from "./AppContent";
import { SsrAppRoutes } from "./router/ssrAppRoutes";
import { SsrProviders } from "./ssr/SsrProviders";
import { preloadMarketingRoute } from "./ssr/preloadMarketingRoute";
import type { BlogSsrPayload } from "./ssr/blogSsr";

export type RenderOptions = {
  blog?: BlogSsrPayload | null;
};

export type RenderResult = {
  html: string;
  helmet: FilledContext["helmet"];
};

export async function render(pathname: string, options?: RenderOptions): Promise<RenderResult> {
  await preloadMarketingRoute(pathname);
  const helmetContext = {} as FilledContext;
  const html = renderToString(
    <SsrProviders location={pathname} helmetContext={helmetContext} blog={options?.blog}>
      <AppContent RoutesComponent={SsrAppRoutes} />
    </SsrProviders>,
  );
  if (!helmetContext.helmet) {
    throw new Error(`SSR render produced no Helmet context for ${pathname}`);
  }
  return { html, helmet: helmetContext.helmet };
}