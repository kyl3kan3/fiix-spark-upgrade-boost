import { describe, expect, it } from "vitest";
import { resolvePageTitle } from "../pageTitle";

describe("resolvePageTitle", () => {
  it("uses nav labels when available", () => {
    expect(resolvePageTitle("/maintenance")).toBe("Maintenance");
    expect(resolvePageTitle("/checklists/abc")).toBe("PM Checklists");
  });

  it("falls back for unknown paths", () => {
    expect(resolvePageTitle("/unknown-route")).not.toBe("Welcome");
  });
});
