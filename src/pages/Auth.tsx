
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import AuthError from "@/components/auth/AuthError";
import AuthToggle from "@/components/auth/AuthToggle";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthLoader from "@/components/auth/AuthLoader";
import { useAuth } from "@/contexts/AuthContext";
import { useAuthErrorHandler } from "@/hooks/auth/useAuthErrorHandler";
import { useAuthNavigation } from "@/hooks/auth/useAuthNavigation";

const Auth = () => {
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const { isAuthenticated, isLoading } = useAuth();
  const { error, handleError, clearError } = useAuthErrorHandler();
  const { handleAuthSuccess } = useAuthNavigation();

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

  const onAuthSuccess = (email: string) => {
    clearError();
    handleAuthSuccess(email, isSignUp);
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
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <AuthHeader isSignUp={isSignUp} />
        <AuthError message={error} />
        
        {!isAuthenticated && (
          <>
            <AuthForm 
              isSignUp={isSignUp} 
              onSuccess={onAuthSuccess}
              onError={handleError}
            />
            <AuthToggle 
              isSignUp={isSignUp} 
              onToggle={handleToggleMode} 
            />
          </>
        )}
      </div>
    </div>
  );
};

export default Auth;
