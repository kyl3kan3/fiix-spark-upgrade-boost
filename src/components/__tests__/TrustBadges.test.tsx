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

    expect(screen.getByRole("heading", { name: /featured, verified, and launched/i })).toBeInTheDocument();
    expect(screen.getAllByRole("img")).toHaveLength(9);
    expect(screen.getByAltText("Featured on Orynth")).toBeInTheDocument();
    expect(screen.getByAltText("Featured on DanielLaunches")).toBeInTheDocument();
    expect(screen.getByRole("navigation", { name: /free cmms alternative guides/i })).toBeInTheDocument();
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
    expect(screen.getByRole("link", { name: /browse freealternatives\.net/i })).toHaveAttribute(
      "href",
      "https://freealternatives.net/",
    );
  });
});
