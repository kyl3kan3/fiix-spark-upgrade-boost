import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
} from "react-router-dom";
import LandingPage from "@/pages/LandingPage";
import AuthPage from "@/pages/AuthPage";
import DashboardPage from "@/pages/DashboardPage";
import ProtectedRoute from "./ProtectedRoute";
import CompanyRequiredWrapper from "@/components/auth/CompanyRequiredWrapper";
import VendorsPage from "@/pages/VendorsPage";
import NewVendorPage from "@/pages/NewVendorPage";
import EditVendorPage from "@/pages/EditVendorPage";
import TeamPage from "@/pages/TeamPage";
import NewTeamMemberPage from "@/pages/NewTeamMemberPage";
import EditTeamMemberPage from "@/pages/EditTeamMemberPage";
import ProfilePage from "@/pages/ProfilePage";
import DebugVendorPage from "@/pages/DebugVendorPage";
import VendorImportPage from "@/pages/VendorImportPage";

const routes = createBrowserRouter([
  {
    path: "/",
    element: <LandingPage />,
  },
  {
    path: "/auth",
    element: <AuthPage />,
  },
  {
    path: "/dashboard",
    element: (
      <ProtectedRoute>
        <DashboardPage />
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
    path: "/vendors/:id",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <EditVendorPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/team",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <TeamPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/team/new",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <NewTeamMemberPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/team/:id",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <EditTeamMemberPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/profile",
    element: (
      <ProtectedRoute>
        <ProfilePage />
      </ProtectedRoute>
    ),
  },
  {
    path: "/debug-vendor",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <DebugVendorPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
  {
    path: "/vendor-import",
    element: (
      <ProtectedRoute>
        <CompanyRequiredWrapper>
          <VendorImportPage />
        </CompanyRequiredWrapper>
      </ProtectedRoute>
    ),
  },
]);

export default routes;
