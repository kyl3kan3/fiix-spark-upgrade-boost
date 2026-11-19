import React from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StaticRouter } from "react-router-dom/server";
import { HelmetProvider, type FilledContext } from "react-helmet-async";
import { AuthProvider } from "@/providers/AuthContext";
import { BlogSsrProvider, type BlogSsrPayload } from "./blogSsr";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false },
  },
});

export function SsrProviders({
  location,
  helmetContext,
  blog,
  children,
}: {
  location: string;
  helmetContext: FilledContext;
  blog?: BlogSsrPayload | null;
  children: React.ReactNode;
}) {
  return (
    <HelmetProvider context={helmetContext}>
      <QueryClientProvider client={queryClient}>
        <div className="light" style={{ colorScheme: "light" }}>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <StaticRouter location={location} future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
              <BlogSsrProvider value={blog ?? null}>
                <AuthProvider>{children}</AuthProvider>
              </BlogSsrProvider>
            </StaticRouter>
          </TooltipProvider>
        </div>
      </QueryClientProvider>
    </HelmetProvider>
  );
}