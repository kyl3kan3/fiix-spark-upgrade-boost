
import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthForm from "@/components/auth/AuthForm";
import AuthError from "@/components/auth/AuthError";
import AuthToggle from "@/components/auth/AuthToggle";
import AuthHeader from "@/components/auth/AuthHeader";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Check if we should default to signup mode based on URL param
    const params = new URLSearchParams(location.search);
    if (params.get("signup") === "true") {
      setIsSignUp(true);
    }

    // Check if user is already logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setIsAuthenticated(true);
        navigate("/dashboard");
      } else {
        setIsAuthenticated(false);
      }
    };
    
    checkSession();
  }, [location, navigate]);

  const handleAuthSuccess = (email: string) => {
    setAuthError(null);
    if (isSignUp) {
      // Stay on page for signup (since confirmation might be needed)
    } else {
      navigate("/dashboard");
    }
  };

  const handleAuthError = (message: string) => {
    setAuthError(message);
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setAuthError(null); // Clear errors on toggle
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <AuthHeader 
          isSignUp={isSignUp} 
          onBackToDashboard={() => navigate("/dashboard")}
          showBackButton={isAuthenticated} // Only show back button if authenticated
        />
        
        <AuthError message={authError} />
        
        <AuthForm 
          isSignUp={isSignUp} 
          onSuccess={handleAuthSuccess}
          onError={handleAuthError}
        />

        <AuthToggle 
          isSignUp={isSignUp} 
          onToggle={handleToggleMode} 
        />
      </div>
    </div>
  );
};

export default Auth;
