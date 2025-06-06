
import {
  createBrowserRouter,
  RouterProvider,
  Route,
  createRoutesFromElements,
} from "react-router-dom";
import LandingPage from "@/pages/Index";
import AuthPage from "@/pages/Auth";
import DashboardPage from "@/pages/Dashboard";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CompanyRequiredWrapper from "@/components/common/CompanyRequiredWrapper";
import VendorsPage from "@/pages/VendorsPage";
import NewVendorPage from "@/pages/VendorFormPage";
import EditVendorPage from "@/pages/VendorFormPage";
import TeamPage from "@/pages/Team";
import NewTeamMemberPage from "@/pages/TeamSetup";
import EditTeamMemberPage from "@/pages/TeamSetup";
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

export const AppRoutes = () => <RouterProvider router={routes} />;
export default routes;
