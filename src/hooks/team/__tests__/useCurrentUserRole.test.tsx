import { act, renderHook } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { useCurrentUserRole } from "../useCurrentUserRole";

const refreshProfileMock = vi.fn();

const useUserProfileMock = vi.fn();

vi.mock("../useUserProfile", () => ({
  useUserProfile: (...args: unknown[]) => useUserProfileMock(...args),
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("useCurrentUserRole", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    refreshProfileMock.mockReset();
    useUserProfileMock.mockReturnValue({
      profileData: undefined,
      isLoading: true,
      error: null,
      refreshProfile: refreshProfileMock,
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("does not default the role to user when profile loading times out", () => {
    const { result } = renderHook(() => useCurrentUserRole());

    expect(result.current.isLoading).toBe(true);
    expect(result.current.currentUserRole).toBeNull();

    act(() => {
      vi.advanceTimersByTime(5000);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.currentUserRole).toBeNull();
    expect(result.current.timeoutOccurred).toBe(true);
    expect(result.current.canEditRoles).toBe(false);
  });

  it("loads administrator role when profile resolves before timeout", () => {
    useUserProfileMock.mockReturnValue({
      profileData: { role: "administrator" },
      isLoading: false,
      error: null,
      refreshProfile: refreshProfileMock,
    });

    const { result } = renderHook(() => useCurrentUserRole());

    expect(result.current.isLoading).toBe(false);
    expect(result.current.currentUserRole).toBe("administrator");
    expect(result.current.canEditRoles).toBe(true);
    expect(result.current.timeoutOccurred).toBe(false);
  });
});
