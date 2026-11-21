import { describe, expect, it } from "vitest";
import { mergeAuthoritativeUserRole } from "../authoritativeUserRole";
import { filterNavItems, NAV_ITEMS } from "@/components/shell/navConfig";
import { toNavRole } from "../navRole";

describe("mergeAuthoritativeUserRole", () => {
  it("prefers user_roles over profiles.role", () => {
    expect(mergeAuthoritativeUserRole("administrator", "technician")).toBe("administrator");
  });

  it("falls back to profiles.role when user_roles is missing", () => {
    expect(mergeAuthoritativeUserRole(null, "manager")).toBe("manager");
  });
});

describe("nav and route guards follow authoritative role", () => {
  const activeSub = { is_active: true, tier: "pro" as const };
  const billing = NAV_ITEMS.find((i) => i.href === "/billing")!;

  it("hides billing for technician profile role but shows it when user_roles is administrator", () => {
    const staleProfileRole = "technician";
    const authoritative = mergeAuthoritativeUserRole("administrator", staleProfileRole);

    expect(toNavRole(staleProfileRole)).toBe("technician");
    expect(toNavRole(authoritative)).toBe("admin");

    const staleNav = filterNavItems(toNavRole(staleProfileRole), activeSub);
    const authoritativeNav = filterNavItems(toNavRole(authoritative), activeSub);

    expect(staleNav.some((i) => i.href === billing.href)).toBe(false);
    expect(authoritativeNav.some((i) => i.href === billing.href)).toBe(true);
  });

  it("blocks technician paths using authoritative role, not stale profiles.role", () => {
    const authoritative = mergeAuthoritativeUserRole("technician", "administrator");
    expect(toNavRole(authoritative)).toBe("technician");
    expect(billing.hideForRoles).toContain("technician");
  });
});
