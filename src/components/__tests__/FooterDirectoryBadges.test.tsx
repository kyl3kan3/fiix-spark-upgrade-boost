import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import FooterDirectoryBadges from "@/components/FooterDirectoryBadges";
import { DIRECTORY_BADGES } from "@/data/directoryBadges";

describe("FooterDirectoryBadges", () => {
  it("renders every directory badge with original href and rel", () => {
    render(<FooterDirectoryBadges />);

    expect(screen.getAllByRole("img")).toHaveLength(DIRECTORY_BADGES.length);
    for (const badge of DIRECTORY_BADGES) {
      const link = screen.getByRole("link", { name: badge.alt });
      expect(link).toHaveAttribute("href", badge.href);
      expect(link).toHaveAttribute(
        "rel",
        "rel" in badge ? badge.rel : "nofollow noopener noreferrer",
      );
    }
  });
});