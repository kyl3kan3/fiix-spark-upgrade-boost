import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { MemoryRouter } from "react-router-dom";
import TrustBadges from "@/components/TrustBadges";

describe("TrustBadges", () => {
  it("keeps every directory badge and alternative guide visible in the shared section", () => {
    render(
      <MemoryRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <TrustBadges />
      </MemoryRouter>,
    );

    expect(screen.getByRole("heading", { name: /directories & comparisons/i })).toBeInTheDocument();
    expect(screen.queryAllByRole("img")).toHaveLength(0);
    expect(screen.getByText("Featured on Orynth")).toBeInTheDocument();
    expect(screen.getByText("Featured on DanielLaunches")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /cmms alternative guides/i })).toBeInTheDocument();
    const alternativeLinks = [
      ["Fiix alternative", "/compare/maintenease-vs-fiix"],
      ["UpKeep alternative", "/compare/maintenease-vs-upkeep"],
      ["MaintainX alternative", "/compare/maintenease-vs-maintainx"],
      ["Limble alternative", "/compare/maintenease-vs-limble"],
      ["eMaint alternative", "/compare/maintenease-vs-emaint"],
    ] as const;
    for (const [name, href] of alternativeLinks) {
      expect(screen.getByRole("link", { name })).toHaveAttribute("href", href);
    }
    expect(screen.getByRole("link", { name: /freealternatives\.net/i })).toHaveAttribute(
      "href",
      "https://freealternatives.net/",
    );
  });
});
