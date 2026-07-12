import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useAuthOperations } from "../useAuthOperations";

const { signUpMock } = vi.hoisted(() => ({
  signUpMock: vi.fn(),
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    auth: {
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      signUp: signUpMock,
    },
  },
}));

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
  },
}));

describe("useAuthOperations", () => {
  beforeEach(() => {
    localStorage.clear();
    signUpMock.mockReset().mockResolvedValue({
      data: { user: { identities: [{ id: "identity-1" }] } },
      error: null,
    });
  });

  it("binds the CAPTCHA token to the Supabase Auth signup request", async () => {
    const { result } = renderHook(() => useAuthOperations());

    await act(async () => {
      await result.current.signUp(
        "owner@example.com",
        "SecurePassword123!",
        { company_name: "Example Facilities" },
        "turnstile-token",
      );
    });

    expect(signUpMock).toHaveBeenCalledWith({
      email: "owner@example.com",
      password: "SecurePassword123!",
      options: {
        captchaToken: "turnstile-token",
        data: { company_name: "Example Facilities" },
        emailRedirectTo: `${window.location.origin}/`,
      },
    });
  });
});
