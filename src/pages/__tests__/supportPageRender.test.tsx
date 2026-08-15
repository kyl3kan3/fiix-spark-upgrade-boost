import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HelmetProvider } from "react-helmet-async";
import { MemoryRouter } from "react-router-dom";
import SupportPage from "../SupportPage";
import { SUPPORT_FAQS, SUPPORT_PAGE, SUPPORT_TOPICS } from "@/data/supportPage";

vi.mock("@/components/marketing/MarketingLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));

vi.mock("@/components/marketing/MarketingJsonLd", () => ({
  default: () => null,
}));

afterEach(cleanup);

describe("public support page", () => {
  it("offers direct support and complete no-JS-friendly guidance", () => {
    render(
      <HelmetProvider>
        <MemoryRouter><SupportPage /></MemoryRouter>
      </HelmetProvider>,
    );

    expect(screen.getByRole("heading", { level: 1, name: SUPPORT_PAGE.h1 })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /email support/i })).toHaveAttribute(
      "href",
      SUPPORT_PAGE.emailHref,
    );
    expect(screen.getByRole("link", { name: /signed-in Help Center/i })).toHaveAttribute(
      "href",
      "/help",
    );

    for (const topic of SUPPORT_TOPICS) {
      expect(screen.getByRole("heading", { name: topic.title })).toBeInTheDocument();
    }
    for (const faq of SUPPORT_FAQS) {
      expect(screen.getByText(faq.q)).toBeInTheDocument();
    }
  });
});
