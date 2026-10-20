import { act, cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SignUpForm } from "./SignUpForm";

const verification = vi.hoisted(() => ({
  onVerify: (_token: string) => {},
  onExpire: () => {},
}));

vi.mock("../TurnstileWidget", () => ({
  TurnstileWidget: (props: typeof verification) => {
    verification.onVerify = props.onVerify;
    verification.onExpire = props.onExpire;
    return null;
  },
}));
vi.mock("../GoogleSignInButton", () => ({ GoogleSignInButton: () => null }));
vi.mock("@/hooks/auth/forms/useAuthForm", () => ({
  useAuthForm: () => ({
    email: "owner@example.com", password: "ExamplePassword123!",
    name: "Example Owner", companyName: "Example Facilities",
    setEmail: vi.fn(), setPassword: vi.fn(), setName: vi.fn(), setCompanyName: vi.fn(),
    isLoading: false, handleSubmit: vi.fn(),
  }),
}));

afterEach(cleanup);

describe("signup CAPTCHA requirement", () => {
  it("blocks account creation until verification provides a token", () => {
    render(<SignUpForm onError={vi.fn()} />);
    const submit = screen.getByRole("button", { name: /create account/i });
    expect(submit).toBeDisabled();
    act(() => verification.onVerify("verified-test-token"));
    expect(submit).toBeEnabled();
  });

  it("blocks account creation again when verification expires", () => {
    render(<SignUpForm onError={vi.fn()} />);
    act(() => verification.onVerify("verified-test-token"));
    expect(screen.getByRole("button", { name: /create account/i })).toBeEnabled();
    act(() => verification.onExpire());
    expect(screen.getByRole("button", { name: /create account/i })).toBeDisabled();
  });
});