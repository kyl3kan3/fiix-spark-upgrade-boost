import { describe, expect, it } from "vitest";
import { filterNavItems } from "@/components/shell/navConfig";

describe("navConfig", () => {
  it("includes Pro-gated nav items for an active Pro subscription", () => {
    const visible = filterNavItems("admin", { is_active: true, tier: "pro" });
    const hrefs = visible.map((item) => item.href);
    expect(hrefs).toContain("/automations");
    expect(hrefs).toContain("/parts");
    expect(hrefs).toContain("/lubricants");
    expect(hrefs).not.toContain("/api-keys");
  });

  it("hides technician-restricted items for technicians", () => {
    const visible = filterNavItems("technician", { is_active: true, tier: "pro" });
    const hrefs = visible.map((item) => item.href);
    expect(hrefs).not.toContain("/billing");
    expect(hrefs).not.toContain("/import");
  });
});
