import { describe, expect, it } from "vitest";
import { resolvePageTitle } from "../pageTitle";

describe("resolvePageTitle", () => {
  it("uses nav labels when available", () => {
    expect(resolvePageTitle("/maintenance")).toBe("Maintenance");
    expect(resolvePageTitle("/work-orders")).toBe("Work Orders");
    expect(resolvePageTitle("/checklists/due")).toBe("Due Today");
    expect(resolvePageTitle("/checklists/abc")).toBe("PM Checklists");
    expect(resolvePageTitle("/lubricants")).toBe("Lubricants");
    expect(resolvePageTitle("/parts")).toBe("Parts");
  });

  it("falls back for unknown paths", () => {
    expect(resolvePageTitle("/unknown-route")).not.toBe("Welcome");
  });
});
