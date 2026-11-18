import { describe, expect, it } from "vitest";
import { shouldDeferAuthBootstrap } from "@/lib/deferAuthBootstrap";

describe("shouldDeferAuthBootstrap", () => {
  it("defers on indexable marketing routes", () => {
    expect(shouldDeferAuthBootstrap("/")).toBe(true);
    expect(shouldDeferAuthBootstrap("/pricing")).toBe(true);
    expect(shouldDeferAuthBootstrap("/best-cmms-software-for-small-business")).toBe(true);
  });

  it("does not defer on auth or app routes", () => {
    expect(shouldDeferAuthBootstrap("/auth")).toBe(false);
    expect(shouldDeferAuthBootstrap("/dashboard")).toBe(false);
    expect(shouldDeferAuthBootstrap("/billing")).toBe(false);
  });
});