import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useUnifiedAuthValidation } from "../useUnifiedAuthValidation";

describe("useUnifiedAuthValidation", () => {
  it("requires a company name during signup", () => {
    const { result } = renderHook(() => useUnifiedAuthValidation());

    const validation = result.current.validateSignUpForm(
      "owner@example.com",
      "SecurePassword123!",
      "Casey Owner",
      "",
    );

    expect(validation).toEqual({
      isValid: false,
      error: "Company name is required",
    });
  });

  it("accepts a complete signup form", () => {
    const { result } = renderHook(() => useUnifiedAuthValidation());

    expect(
      result.current.validateSignUpForm(
        "owner@example.com",
        "SecurePassword123!",
        "Casey Owner",
        "Example Facilities",
      ),
    ).toEqual({ isValid: true });
  });
});
