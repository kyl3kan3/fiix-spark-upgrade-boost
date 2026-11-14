import { beforeEach, describe, expect, it, vi } from "vitest";

const getUserMock = vi.fn();
const profileSingleMock = vi.fn();
const userRolesMaybeSingleMock = vi.fn();

vi.mock("@/services/supabaseHelpers", () => ({
  getCurrentUser: () => getUserMock(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: (table: string) => {
      if (table === "profiles") {
        return {
          select: () => ({
            eq: () => ({ single: () => profileSingleMock() }),
          }),
        };
      }
      if (table === "user_roles") {
        return {
          select: () => ({
            eq: () => ({ maybeSingle: () => userRolesMaybeSingleMock() }),
          }),
        };
      }
      throw new Error(`unexpected table ${table}`);
    },
  },
}));

import { getCurrentUserProfile } from "../profile";

describe("getCurrentUserProfile", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    profileSingleMock.mockReset();
    userRolesMaybeSingleMock.mockReset();
  });

  it("returns user_roles role when profiles.role is stale", async () => {
    getUserMock.mockResolvedValue({ id: "user-1" });
    profileSingleMock.mockResolvedValue({
      data: { id: "user-1", role: "technician", company_id: "c1" },
    });
    userRolesMaybeSingleMock.mockResolvedValue({ data: { role: "administrator" }, error: null });

    const profile = await getCurrentUserProfile();
    expect(profile?.role).toBe("administrator");
  });

  it("falls back to profiles.role when user_roles has no row", async () => {
    getUserMock.mockResolvedValue({ id: "user-1" });
    profileSingleMock.mockResolvedValue({
      data: { id: "user-1", role: "manager", company_id: "c1" },
    });
    userRolesMaybeSingleMock.mockResolvedValue({ data: null, error: null });

    const profile = await getCurrentUserProfile();
    expect(profile?.role).toBe("manager");
  });
});
