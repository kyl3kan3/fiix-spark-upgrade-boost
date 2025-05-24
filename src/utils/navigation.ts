
import { NavigateFunction } from "react-router-dom";

export const redirectToAuth = (navigate: NavigateFunction) => {
  navigate("/auth", { replace: true });
};

export const redirectToDashboard = (navigate: NavigateFunction) => {
  navigate("/dashboard", { replace: true });
};

export const redirectToSetup = (navigate: NavigateFunction, forceSetup = false) => {
  const params = forceSetup ? "?forceSetup=true" : "";
  navigate(`/setup${params}`, { replace: true });
};

export const redirectToCompanySetup = (navigate: NavigateFunction) => {
  navigate("/company-setup", { replace: true });
};

export const getAuthRedirectPath = (isAuthenticated: boolean): string => {
  return isAuthenticated ? "/dashboard" : "/auth";
};
