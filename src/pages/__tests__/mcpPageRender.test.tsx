import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import McpPage from "../McpPage";
import { MCP_PAGE } from "@/data/mcpPage";

vi.mock("@/components/marketing/MarketingLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/marketing/MarketingJsonLd", () => ({
  default: () => null,
}));

afterEach(cleanup);

describe("MCP discovery page", () => {
  it("publishes the endpoint, exact tools, and crawler resources", () => {
    render(
      <HelmetProvider>
        <MemoryRouter>{<McpPage />}</MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByRole("heading", { level: 1, name: MCP_PAGE.h1 })).toBeInTheDocument();
    expect(screen.getByText(MCP_PAGE.endpoint)).toBeInTheDocument();

    for (const tool of MCP_PAGE.tools) {
      expect(screen.getByText(tool.name)).toBeInTheDocument();
    }

    expect(screen.getByRole("link", { name: /view server card/i })).toHaveAttribute(
      "href",
      MCP_PAGE.serverCardUrl,
    );
    expect(screen.getByRole("link", { name: /read clean markdown/i })).toHaveAttribute(
      "href",
      MCP_PAGE.markdownUrl,
    );
    expect(screen.getByRole("heading", { name: MCP_PAGE.faqs[0].q })).toBeInTheDocument();
  });
});
