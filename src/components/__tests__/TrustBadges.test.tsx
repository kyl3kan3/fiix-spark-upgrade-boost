import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import TrustBadges from "@/components/TrustBadges";

describe("TrustBadges", () => {
  it("keeps every directory badge visible in the shared section", () => {
    render(<TrustBadges />);

    expect(screen.getByRole("heading", { name: /featured, verified, and launched/i })).toBeInTheDocument();
    expect(screen.getAllByRole("link")).toHaveLength(9);
    expect(screen.getByAltText("Featured on Orynth")).toBeInTheDocument();
    expect(screen.getByAltText("Featured on DanielLaunches")).toBeInTheDocument();
  });
});
