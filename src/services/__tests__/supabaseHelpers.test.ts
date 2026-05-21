import { beforeEach, describe, expect, it, vi } from "vitest";

const getUserMock = vi.fn();
const maybeSingleMock = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: { getUser: () => getUserMock() },
    from: () => ({
      select: () => ({
        eq: () => ({ maybeSingle: () => maybeSingleMock() }),
      }),
    }),
  },
}));

// Import after the mock so the helpers pick up the stubbed client.
import {
  getCurrentUser,
  requireUser,
  requireUserCompany,
  tryGetUserCompany,
} from "../supabaseHelpers";

describe("supabaseHelpers", () => {
  beforeEach(() => {
    getUserMock.mockReset();
    maybeSingleMock.mockReset();
  });

  describe("getCurrentUser", () => {
    it("returns the user when authenticated", async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
      expect(await getCurrentUser()).toEqual({ id: "u1" });
    });

    it("returns null when unauthenticated", async () => {
      getUserMock.mockResolvedValue({ data: { user: null } });
      expect(await getCurrentUser()).toBeNull();
    });
  });

  describe("requireUser", () => {
    it("returns the user when authenticated", async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
      await expect(requireUser()).resolves.toEqual({ id: "u1" });
    });

    it("throws when unauthenticated", async () => {
      getUserMock.mockResolvedValue({ data: { user: null } });
      await expect(requireUser()).rejects.toThrow(/signed in/i);
    });
  });

  describe("requireUserCompany", () => {
    it("returns userId + companyId on the happy path", async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
      maybeSingleMock.mockResolvedValue({ data: { company_id: "c1" }, error: null });
      await expect(requireUserCompany()).resolves.toEqual({ userId: "u1", companyId: "c1" });
    });

    it("throws when unauthenticated", async () => {
      getUserMock.mockResolvedValue({ data: { user: null } });
      await expect(requireUserCompany()).rejects.toThrow(/signed in/i);
    });

    it("throws when the profile lookup errors", async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
      maybeSingleMock.mockResolvedValue({ data: null, error: new Error("db down") });
      await expect(requireUserCompany()).rejects.toThrow(/db down/);
    });

    it("throws when the user has no company", async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
      maybeSingleMock.mockResolvedValue({ data: { company_id: null }, error: null });
      await expect(requireUserCompany()).rejects.toThrow(/not linked to a company/i);
    });
  });

  describe("tryGetUserCompany", () => {
    it("returns an empty object when unauthenticated", async () => {
      getUserMock.mockResolvedValue({ data: { user: null } });
      await expect(tryGetUserCompany()).resolves.toEqual({});
    });

    it("returns the user id even when the company is missing", async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
      maybeSingleMock.mockResolvedValue({ data: null, error: null });
      await expect(tryGetUserCompany()).resolves.toEqual({
        userId: "u1",
        companyId: undefined,
      });
    });

    it("returns both ids when both are present", async () => {
      getUserMock.mockResolvedValue({ data: { user: { id: "u1" } } });
      maybeSingleMock.mockResolvedValue({ data: { company_id: "c1" }, error: null });
      await expect(tryGetUserCompany()).resolves.toEqual({ userId: "u1", companyId: "c1" });
    });
  });
});
