import React, { useEffect, useMemo, useState, type ComponentType, type ReactNode } from "react";
import { DeferredToasters } from "@/components/DeferredToasters";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider, type FilledContext } from "react-helmet-async";
import { MarketingAuthProvider } from "@/providers/MarketingAuthProvider";
import { marketingAuthStub } from "@/providers/authContextShared";
import { AuthContext } from "@/providers/authContextShared";
import { shouldDeferAuthBootstrap } from "@/lib/deferAuthBootstrap";

import { MarketingLightShell } from "@/components/theme/MarketingLightShell";
import { BlogSsrProvider, blogSsrPayloadForPath, type BlogSsrPayload } from "@/ssr/blogSsr";
import { useLocation } from "react-router-dom";
import { readBlogSsrPayloadFromDom } from "@/ssr/readBlogSsrPayloadFromDom";

const queryClient = new QueryClient();

export type AppProvidersSsrProps = {
  location: string;
  helmetContext: FilledContext;
  blog?: BlogSsrPayload | null;
};

interface AppProvidersProps {
  children: React.ReactNode;
  /** When set, use StaticRouter + serialized blog payload (must match prerendered HTML). */
  ssr?: AppProvidersSsrProps;
  /** Marketing hydrate: first paint stays on `ssr`; after mount, use BrowserRouter. */
  marketingHydrate?: boolean;
}

function ProviderTree({
  blogPayload,
  scopeBlogByPath,
  children,
}: {
  blogPayload: BlogSsrPayload | null;
  scopeBlogByPath?: boolean;
  children: React.ReactNode;
}) {
  const { pathname } = useLocation();
  const deferAuth = shouldDeferAuthBootstrap(pathname);
  const [LiveAuthProvider, setLiveAuthProvider] = useState<ComponentType<{ children: ReactNode }> | null>(
    null,
  );

  useEffect(() => {
    if (deferAuth) {
      setLiveAuthProvider(null);
      return;
    }
    let cancelled = false;
    void import("@/providers/AuthContext").then((m) => {
      if (!cancelled) setLiveAuthProvider(() => m.AuthProvider);
    });
    return () => {
      cancelled = true;
    };
  }, [deferAuth]);

  const scopedBlog = useMemo(
    () => (scopeBlogByPath ? blogSsrPayloadForPath(blogPayload, pathname) : blogPayload),
    [blogPayload, pathname, scopeBlogByPath],
  );

  const authWrapper = deferAuth ? (
    <MarketingAuthProvider>{children}</MarketingAuthProvider>
  ) : LiveAuthProvider ? (
    <LiveAuthProvider>{children}</LiveAuthProvider>
  ) : (
    <AuthContext.Provider value={marketingAuthStub}>{children}</AuthContext.Provider>
  );

  return (
    <MarketingLightShell>
      <TooltipProvider>
        <DeferredToasters />
        <BlogSsrProvider value={scopedBlog}>{authWrapper}</BlogSsrProvider>
      </TooltipProvider>
    </MarketingLightShell>
  );
}

export const AppProviders: React.FC<AppProvidersProps> = ({ children, ssr, marketingHydrate }) => {
  const [useBrowserRouter, setUseBrowserRouter] = useState(!(ssr || marketingHydrate));

  useEffect(() => {
    if (marketingHydrate) setUseBrowserRouter(true);
  }, [marketingHydrate]);

  const ssrActive = Boolean(ssr && !useBrowserRouter);

  const initialBlogSsrPayload = useMemo(
    () => (ssrActive ? ssr!.blog ?? null : readBlogSsrPayloadFromDom()),
    [ssr, ssrActive],
  );

  if (ssrActive && ssr) {
    return (
      <HelmetProvider context={ssr.helmetContext}>
        <QueryClientProvider client={queryClient}>
          <StaticRouter location={ssr.location} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
            <ProviderTree blogPayload={initialBlogSsrPayload} scopeBlogByPath={false}>
              {children}
            </ProviderTree>
          </StaticRouter>
        </QueryClientProvider>
      </HelmetProvider>
    );
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <ProviderTree blogPayload={initialBlogSsrPayload} scopeBlogByPath>
            {children}
          </ProviderTree>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
};