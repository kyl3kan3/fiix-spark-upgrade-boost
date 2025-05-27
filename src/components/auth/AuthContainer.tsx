
import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { AuthLayout } from "./AuthLayout";
import { AuthContent } from "./AuthContent";
import { useAuth } from "@/hooks/auth";
import { useAuthErrorHandler } from "@/hooks/auth/useAuthErrorHandler";
import { useAuthNavigation } from "@/hooks/auth/useAuthNavigation";
import AuthLoader from "./AuthLoader";
import { AUTH_STORAGE_KEYS } from "@/constants/authConstants";

export const AuthContainer: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { error, handleError, clearError } = useAuthErrorHandler();
  const { redirectToDashboard } = useAuthNavigation();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      // Check if there's a redirect location from ProtectedRoute
      const from = location.state?.from?.pathname || "/dashboard";
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, isLoading, navigate, location.state]);

  // Check for stored auth errors
  useEffect(() => {
    const storedError = localStorage.getItem(AUTH_STORAGE_KEYS.AUTH_ERROR);
    if (storedError) {
      handleError(storedError);
      localStorage.removeItem(AUTH_STORAGE_KEYS.AUTH_ERROR);
    }
  }, [handleError]);

  // Check if we should default to signup mode
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("signup") === "true") {
      setIsSignUp(true);
    }
    clearError();
  }, [location, clearError]);

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    clearError();
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <AuthLoader 
        title="Checking Authentication" 
        message="Please wait while we verify your login status..." 
      />
    );
  }

  return (
    <AuthLayout>
      <AuthContent 
        isSignUp={isSignUp}
        error={error}
        onError={handleError}
        onToggleMode={handleToggleMode}
      />
    </AuthLayout>
  );
};
