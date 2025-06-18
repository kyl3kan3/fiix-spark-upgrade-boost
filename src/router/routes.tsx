import { createBrowserRouter } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CompanyRequiredWrapper from "@/components/auth/CompanyRequiredWrapper";
import InspectionsPage from "@/pages/InspectionsPage";
import NewInspectionPage from "@/pages/NewInspectionPage";
import InspectionDetailsPage from "@/pages/InspectionDetailsPage";
import AssetsPage from "@/pages/AssetsPage";
import NewAssetPage from "@/pages/NewAssetPage";
import EditAssetPage from "@/pages/EditAssetPage";
import VendorsPage from "@/pages/VendorsPage";
import NewVendorPage from "@/pages/NewVendorPage";
import EditVendorPage from "@/pages/EditVendorPage";
import WorkOrdersPage from "@/pages/WorkOrdersPage";
import NewWorkOrderPage from "@/pages/NewWorkOrderPage";
import EditWorkOrderPage from "@/pages/EditWorkOrderPage";
import ChecklistsPage from "@/pages/ChecklistsPage";
import NewChecklistPage from "@/pages/NewChecklistPage";
import EditChecklistPage from "@/pages/EditChecklistPage";
import ChecklistSubmitPage from "@/pages/ChecklistSubmitPage";
import ChecklistSubmissionsPage from "@/pages/ChecklistSubmissionsPage";

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Index />,
  },
  {
    path: "/auth",
    element: <Auth />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <Dashboard />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/inspections",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <InspectionsPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/inspections/new",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <NewInspectionPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/inspections/:id",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <InspectionDetailsPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/assets",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <AssetsPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/assets/new",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <NewAssetPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/assets/:id/edit",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <EditAssetPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/vendors",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <VendorsPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/vendors/new",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <NewVendorPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/vendors/:id/edit",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <EditVendorPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/work-orders",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <WorkOrdersPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/work-orders/new",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <NewWorkOrderPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/work-orders/:id/edit",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <EditWorkOrderPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/checklists",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <ChecklistsPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/checklists/new",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <NewChecklistPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/checklists/:id/edit",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <EditChecklistPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/checklists/:id/submit",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <ChecklistSubmitPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/checklists/submissions",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <ChecklistSubmissionsPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
