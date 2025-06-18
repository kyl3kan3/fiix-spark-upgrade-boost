
import { createBrowserRouter } from "react-router-dom";
import Index from "@/pages/Index";
import Auth from "@/pages/Auth";
import Dashboard from "@/pages/Dashboard";
import NotFound from "@/pages/NotFound";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import InspectionsPage from "@/pages/InspectionsPage";
import NewInspectionPage from "@/pages/NewInspectionPage";
import AssetsPage from "@/pages/AssetsPage";
import VendorsPage from "@/pages/VendorsPage";
import WorkOrdersPage from "@/pages/WorkOrdersPage";
import ChecklistsPage from "@/pages/ChecklistsPage";
import NewChecklistPage from "@/pages/NewChecklistPage";
import EditChecklistPage from "@/pages/EditChecklistPage";
import ChecklistDetailPage from "@/pages/ChecklistDetailPage";
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
        <Dashboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/inspections",
    element: (
      <ProtectedRoute>
        <InspectionsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/inspections/new",
    element: (
      <ProtectedRoute>
        <NewInspectionPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/assets",
    element: (
      <ProtectedRoute>
        <AssetsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/vendors",
    element: (
      <ProtectedRoute>
        <VendorsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/work-orders",
    element: (
      <ProtectedRoute>
        <WorkOrdersPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/checklists",
    element: (
      <ProtectedRoute>
        <ChecklistsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/checklists/new",
    element: (
      <ProtectedRoute>
        <NewChecklistPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/checklists/:id",
    element: (
      <ProtectedRoute>
        <ChecklistDetailPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/checklists/:id/edit",
    element: (
      <ProtectedRoute>
        <EditChecklistPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/checklists/:id/submit",
    element: (
      <ProtectedRoute>
        <ChecklistSubmitPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/checklists/submissions",
    element: (
      <ProtectedRoute>
        <ChecklistSubmissionsPage />
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <NotFound />,
  },
]);
