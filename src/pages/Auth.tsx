
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
    const params = new URLSearchParams(location.search);
    if (params.get("signup") === "true") {
      setIsSignUp(true);
    }
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
      navigate("/setup");
    } else {
      navigate("/dashboard");
    }
  };

  const handleAuthError = (message: string) => {
    setAuthError(message);
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setAuthError(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center 
      bg-gradient-to-br from-[#e5deff] via-[#d6bcfa] to-[#9b87f5] 
      animate-fade-in transition-all duration-700">
      <div
        className="
          max-w-md w-full glass p-10 rounded-2xl shadow-2xl
          animate-scale-in
          transition-all duration-500
          border border-white/60
          backdrop-blur-2xl
          bg-white/80 dark:bg-card/70
        "
        style={{
          boxShadow: "0 8px 40px 8px rgba(155,135,245,0.13), 0 2px 16px rgba(64,62,67,.11)",
        }}
      >
        <AuthHeader
          isSignUp={isSignUp}
          onBackToDashboard={() => navigate("/dashboard")}
          showBackButton={isAuthenticated}
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
