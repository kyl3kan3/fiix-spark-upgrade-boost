
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import AuthError from "@/components/auth/AuthError";
import AuthToggle from "@/components/auth/AuthToggle";
import AuthHeader from "@/components/auth/AuthHeader";
import { useAuth } from "@/contexts/AuthContext";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  
  const { isAuthenticated, isLoading } = useAuth();

  // Check for stored auth errors
  useEffect(() => {
    const storedError = localStorage.getItem("auth_error");
    if (storedError) {
      setAuthError(storedError);
      localStorage.removeItem("auth_error");
    }
  }, []);

  // Check if we should default to signup mode
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("signup") === "true") {
      setIsSignUp(true);
    }
    setAuthError(null);
  }, [location]);

  // Redirect authenticated users
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleAuthSuccess = (email: string) => {
    setAuthError(null);
    localStorage.setItem("last_email", email);
    if (!isSignUp) {
      navigate("/dashboard", { replace: true });
    }
  };

  const handleAuthError = (message: string) => {
    setAuthError(message);
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setAuthError(null);
  };

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4">Checking authentication...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <AuthHeader isSignUp={isSignUp} />
        <AuthError message={authError} />
        
        {!isAuthenticated && (
          <>
            <AuthForm 
              isSignUp={isSignUp} 
              onSuccess={handleAuthSuccess}
              onError={handleAuthError}
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
