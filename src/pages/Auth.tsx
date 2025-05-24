
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { AuthLayout } from "@/components/auth/AuthLayout";
import AuthForm from "@/components/auth/AuthForm";
import AuthError from "@/components/auth/AuthError";
import AuthToggle from "@/components/auth/AuthToggle";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthLoader from "@/components/auth/AuthLoader";
import { useAuth } from "@/hooks/auth";
import { useAuthErrorHandler } from "@/hooks/auth/useAuthErrorHandler";
import { useAuthNavigation } from "@/hooks/auth/useAuthNavigation";

const Auth = () => {
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { error, handleError, clearError } = useAuthErrorHandler();
  const { redirectToDashboard } = useAuthNavigation();

  // Redirect if already authenticated
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      redirectToDashboard();
    }
  }, [isAuthenticated, isLoading, redirectToDashboard]);

  // Check for stored auth errors
  useEffect(() => {
    const storedError = localStorage.getItem("auth_error");
    if (storedError) {
      handleError(storedError);
      localStorage.removeItem("auth_error");
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
      <AuthHeader isSignUp={isSignUp} />
      <AuthError message={error} />
      
      <AuthForm 
        isSignUp={isSignUp} 
        onError={handleError}
      />
      <AuthToggle 
        isSignUp={isSignUp} 
        onToggle={handleToggleMode} 
      />
    </AuthLayout>
  );
};

export default Auth;
