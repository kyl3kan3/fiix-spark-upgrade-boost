import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, cleanup } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";

/**
 * Render-based CI test: mounts each key marketing route, lets react-helmet
 * flush tags into document.head, and asserts the head contains the required
 * twitter / og tags plus Organization + WebSite JSON-LD.
 *
 * Fails the build if any required tag is missing or mismatched.
 */

// --- Stubs for backend dependencies so marketing pages render in jsdom ---

vi.mock("@/integrations/supabase/client", () => {
 const chain: any = {
 select: () => chain,
 eq: () => chain,
 maybeSingle: () => Promise.resolve({ data: null, error: null }),
 single: () => Promise.resolve({ data: null, error: null }),
 insert: () => Promise.resolve({ data: null, error: null }),
 update: () => chain,
 delete: () => chain,
 order: () => chain,
 limit: () => chain,
 then: (resolve: any) => Promise.resolve({ data: [], error: null }).then(resolve),
 };
 return {
 supabase: {
 auth: {
 getSession: () => Promise.resolve({ data: { session: null }, error: null }),
 getUser: () => Promise.resolve({ data: { user: null }, error: null }),
 onAuthStateChange: () => ({ data: { subscription: { unsubscribe: () => {} } } }),
 signOut: () => Promise.resolve({ error: null }),
 },
 from: () => chain,
 functions: { invoke: () => Promise.resolve({ data: null, error: null }) },
 channel: () => ({
 on: () => ({ subscribe: () => ({ unsubscribe: () => {} }) }),
 subscribe: () => ({ unsubscribe: () => {} }),
 }),
 removeChannel: () => {},
 },
 };
});

vi.mock("@/contexts/AuthContext", () => ({
 AuthProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
 useAuth: () => ({ user: null, session: null, loading: false, signOut: () => Promise.resolve() }),
}));

import Index from "../Index";
import SolutionsIndex from "../SolutionsIndex";
import SolutionPage from "../SolutionPage";
import LearnIndex from "../LearnIndex";
import LearnArticle from "../LearnArticle";

const EXPECTED_IMAGE = "https://maintenease.com/og-image.png";

type RouteCase = {
 name: string;
 path: string;
 routePattern: string;
 element: React.ReactNode;
};

const ROUTES: RouteCase[] = [
 { name: "Home", path: "/", routePattern: "/", element: <Index /> },
 { name: "Solutions index", path: "/solutions", routePattern: "/solutions", element: <SolutionsIndex /> },
 {
 name: "Solution detail",
 path: "/solutions/asset-management-software",
 routePattern: "/solutions/:slug",
 element: <SolutionPage />,
 },
 { name: "Learn index", path: "/learn", routePattern: "/learn", element: <LearnIndex /> },
 {
 name: "Learn article",
 path: "/learn/cmms",
 routePattern: "/learn/:slug",
 element: <LearnArticle />,
 },
];

function renderRoute(route: RouteCase) {
 const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
 return render(
 <HelmetProvider>
 <QueryClientProvider client={queryClient}>
 <MemoryRouter initialEntries={[route.path]}>
 <Routes>
 <Route path={route.routePattern} element={route.element} />
 </Routes>
 </MemoryRouter>
 </QueryClientProvider>
 </HelmetProvider>,
 );
}

async function flushHelmet() {
 // react-helmet writes to document.head via requestAnimationFrame after mount;
 // give it a few ticks to flush, especially between consecutive renders.
 for (let i = 0; i < 5; i += 1) {
 await new Promise((r) => setTimeout(r, 10));
 }
}

function metaByAttr(attr: "property" | "name", key: string): string | null {
 const el = document.head.querySelector(`meta[${attr}="${key}"]`);
 return el ? el.getAttribute("content") : null;
}

function jsonLdTypes(): string[] {
 const scripts = document.head.querySelectorAll('script[type="application/ld+json"]');
 const types: string[] = [];
 scripts.forEach((s) => {
 try {
 const parsed = JSON.parse(s.textContent ?? "");
 if (parsed && parsed["@type"]) types.push(parsed["@type"]);
 } catch {
 // ignore non-JSON
 }
 });
 return types;
}

describe("rendered head for key routes", () => {
 beforeEach(() => {
 document.head.innerHTML = "";
 });
 afterEach(() => {
 cleanup();
 document.head.innerHTML = "";
 });

 for (const route of ROUTES) {
 describe(`${route.name} (${route.path})`, () => {
 it("sets required twitter/og tags and Organization+WebSite JSON-LD", async () => {
 renderRoute(route);
 await flushHelmet();

 const card = metaByAttr("name", "twitter:card");
 const twTitle = metaByAttr("name", "twitter:title");
 const twDesc = metaByAttr("name", "twitter:description");
 const twImage = metaByAttr("name", "twitter:image");
 const ogImage = metaByAttr("property", "og:image");
 const ogTitle = metaByAttr("property", "og:title");
 const ogDesc = metaByAttr("property", "og:description");
 const ogUrl = metaByAttr("property", "og:url");

 expect(card, `${route.name}: twitter:card missing`).toBe("summary_large_image");
 expect(twTitle, `${route.name}: twitter:title missing`).toBeTruthy();
 expect(twDesc, `${route.name}: twitter:description missing`).toBeTruthy();
 expect(twImage, `${route.name}: twitter:image mismatch`).toBe(EXPECTED_IMAGE);
 expect(ogImage, `${route.name}: og:image mismatch`).toBe(EXPECTED_IMAGE);
 expect(ogTitle, `${route.name}: og:title missing`).toBeTruthy();
 expect(ogDesc, `${route.name}: og:description missing`).toBeTruthy();
 expect(ogUrl, `${route.name}: og:url missing`).toBeTruthy();

 const types = jsonLdTypes();
 expect(types, `${route.name}: Organization JSON-LD missing`).toContain("Organization");
 expect(types, `${route.name}: WebSite JSON-LD missing`).toContain("WebSite");
 });
 });
 }
});