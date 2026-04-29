import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

vi.mock("@/components/dashboard/DashboardLayout", () => ({
  default: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/hooks/team/useUserRolePermissions", () => ({
  useUserRolePermissions: () => ({ currentUserRole: "administrator" }),
}));
vi.mock("@/components/workOrders/assets/AssetForm", () => ({
  AssetForm: ({ assetId }: { assetId?: string }) => (
    <div data-testid="asset-form">Form for {assetId ?? "new"}</div>
  ),
}));
vi.mock("@/services/assets/assetQueries", () => ({
  getAssetById: vi.fn(async (id: string) => {
    if (id === "missing") throw new Error("not found");
    return { id, name: "Test Pump", status: "operational", description: "desc" };
  }),
  getAllAssets: vi.fn(async () => []),
}));

import AssetFormPage from "@/pages/AssetFormPage";
import AssetDetailPage from "@/pages/AssetDetailPage";

const renderAt = (path: string) => {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[path]}>
        <Routes>
          <Route path="/assets/:assetId" element={<AssetDetailPage />} />
          <Route path="/assets/:assetId/edit" element={<AssetFormPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
};

describe("Asset routes", () => {
  it("renders edit page with asset id from URL", async () => {
    renderAt("/assets/abc-123/edit");
    await waitFor(() => {
      expect(screen.getByTestId("asset-form")).toHaveTextContent("Form for abc-123");
    });
  });

  it("renders detail page with asset name and edit link", async () => {
    renderAt("/assets/abc-123");
    await waitFor(() => {
      expect(screen.getByText("Test Pump")).toBeInTheDocument();
    });
    const editLink = screen.getByRole("link", { name: /edit asset/i });
    expect(editLink).toHaveAttribute("href", "/assets/abc-123/edit");
  });

  it("shows not-found fallback for missing asset", async () => {
    renderAt("/assets/missing");
    await waitFor(() => {
      expect(screen.getByText(/Equipment not found/i)).toBeInTheDocument();
    });
  });
});