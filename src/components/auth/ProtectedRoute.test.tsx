import { cleanup, render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom";
import { afterEach, describe, expect, it, vi } from "vitest";
import ProtectedRoute from "./ProtectedRoute";

const state = vi.hoisted(() => ({
  role: "technician",
  active: false,
  profileLoading: false,
  subscriptionLoading: false,
}));

vi.mock("@/hooks/auth", () => ({
  useAuth: () => ({ isAuthenticated: true, isLoading: false }),
}));
vi.mock("@/hooks/profile/useProfile", () => ({
  useProfile: () => ({
    profile: state.profileLoading ? null : { role: state.role, company_id: "company-1" },
    isLoading: state.profileLoading,
  }),
}));
vi.mock("@/hooks/useSubscription", () => ({
  useSubscription: () => ({
    data: { is_active: state.active }, isLoading: state.subscriptionLoading,
  }),
}));
vi.mock("@/components/billing/SubscriptionStatusBanner", () => ({
  SubscriptionStatusBanner: () => null,
}));

afterEach(() => {
  cleanup();
  state.role = "technician";
  state.active = false;
  state.profileLoading = false;
  state.subscriptionLoading = false;
});

function CurrentPage() {
  const location = useLocation();
  return <output data-testid="current-page">{location.pathname}{location.search}</output>;
}

function open(path: string) {
  return render(
    <MemoryRouter initialEntries={[path]}>
      <Routes>
        <Route path="*" element={<ProtectedRoute><CurrentPage /></ProtectedRoute>} />
      </Routes>
    </MemoryRouter>,
  );
}

describe("subscription recovery routing", () => {
  it.each(["/dashboard", "/work-orders", "/billing", "/billing/history", "/import"])(
    "settles inactive technicians on Profile from %s without granting Billing access",
    async (path) => {
      open(path);
      await waitFor(() => expect(screen.getByTestId("current-page").textContent).toBe("/profile?inactive=1"));
    },
  );

  it("keeps Profile usable for inactive technicians", () => {
    open("/profile");
    expect(screen.getByTestId("current-page").textContent).toBe("/profile");
  });

  it.each(["administrator", "manager"])("keeps inactive %s recovery on Billing", async (role) => {
    state.role = role;
    open("/dashboard");
    await waitFor(() => expect(screen.getByTestId("current-page").textContent).toBe("/billing?inactive=1"));
  });

  it.each(["/billing", "/import"])("keeps active technicians blocked from %s", async (path) => {
    state.active = true;
    open(path);
    await waitFor(() => expect(screen.getByTestId("current-page").textContent).toBe("/dashboard"));
  });

  it("settles on Profile when the technician profile arrives after the subscription", async () => {
    state.profileLoading = true;
    const view = open("/dashboard");
    await waitFor(() => expect(screen.getByTestId("current-page").textContent).toBe("/billing?inactive=1"));
    state.profileLoading = false;
    view.rerender(
      <MemoryRouter initialEntries={["/dashboard"]}>
        <Routes>
          <Route path="*" element={<ProtectedRoute><CurrentPage /></ProtectedRoute>} />
        </Routes>
      </MemoryRouter>,
    );
    await waitFor(() => expect(screen.getByTestId("current-page").textContent).toBe("/profile?inactive=1"));
  });
});