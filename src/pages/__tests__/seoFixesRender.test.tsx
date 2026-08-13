import { cleanup, render, screen, within } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import LearnArticle from "@/pages/LearnArticle";
import ComparePage from "@/pages/ComparePage";
import TemplatePage from "@/pages/TemplatePage";

vi.mock("@/components/marketing/MarketingLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/marketing/MarketingJsonLd", () => ({ default: () => null }));
vi.mock("@/components/marketing/ShareButtons", () => ({ default: () => null }));
vi.mock("@/lib/analytics/marketingEvents", () => ({
  getAttributionMetadata: () => ({}),
  trackMarketingEvent: vi.fn(),
}));

const renderRoute = (path: string, routePattern: string, element: React.ReactNode) => render(
  <HelmetProvider>
    <MemoryRouter
      future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
      initialEntries={[path]}
    >
      <Routes>
        <Route path={routePattern} element={element} />
      </Routes>
    </MemoryRouter>
  </HelmetProvider>,
);

afterEach(cleanup);

describe("SEO fix rendering", () => {
  it("renders the exact CMMS meaning heading and requested internal anchors", () => {
    renderRoute("/learn/cmms", "/learn/:slug", <LearnArticle />);

    expect(screen.getByRole("heading", { name: "CMMS meaning in plain English" })).toBeInTheDocument();
    const expectedLinks = [
      ["work order software", "/solutions/work-order-software"],
      ["MaintenEase vs UpKeep", "/compare/maintenease-vs-upkeep"],
      ["MaintenEase vs MaintainX", "/compare/maintenease-vs-maintainx"],
      ["MaintenEase vs Limble", "/compare/maintenease-vs-limble"],
      ["asset tracking software", "/solutions/asset-tracking-software"],
    ];

    for (const [name, href] of expectedLinks) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
  });

  it.each([
    ["maintenease-vs-upkeep", "UpKeep pricing in 2026", "$55/user/mo"],
    ["maintenease-vs-maintainx", "MaintainX cost in 2026", "$20/user/mo annual; $25 monthly"],
    ["maintenease-vs-limble", "Limble pricing in 2026", "Custom estimate"],
  ])("renders the current %s pricing table", (slug, heading, price) => {
    renderRoute(`/compare/${slug}`, "/compare/:slug", <ComparePage />);

    expect(screen.getByRole("heading", { name: heading })).toBeInTheDocument();
    const table = screen.getByRole("table", { name: /plan prices compared with MaintenEase account prices/i });
    expect(within(table).getAllByText(price).length).toBeGreaterThan(0);
    expect(within(table).getByRole("columnheader", { name: "MaintenEase price" })).toBeInTheDocument();
  });

  it("renders the template preview and email-gated download form", () => {
    renderRoute(
      "/templates/maintenance-log-template",
      "/templates/:slug",
      <TemplatePage />,
    );

    expect(screen.getByRole("heading", { name: "Free maintenance log template" })).toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Example rows from the Maintenance Log Template" })).toBeInTheDocument();
    expect(screen.getByLabelText("Work email")).toBeRequired();
    expect(screen.getByRole("button", { name: "Download free CSV" })).toBeInTheDocument();
  });
});
