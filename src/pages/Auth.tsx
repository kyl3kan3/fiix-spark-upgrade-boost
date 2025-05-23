
import { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AuthForm from "@/components/auth/AuthForm";
import AuthError from "@/components/auth/AuthError";
import AuthToggle from "@/components/auth/AuthToggle";
import AuthHeader from "@/components/auth/AuthHeader";
import AuthLoader from "@/components/auth/AuthLoader";
import InviteMessage from "@/components/auth/InviteMessage";
import AuthenticatedMessage from "@/components/auth/AuthenticatedMessage";
import { useInviteProcess } from "@/hooks/useInviteProcess";
import { useAuthRedirection } from "@/hooks/useAuthRedirection";
import { supabase } from "@/integrations/supabase/client";

const Auth = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isSignUp, setIsSignUp] = useState(false);
  
  const {
    inviteToken,
    authError,
    setAuthError,
    isProcessingInvite,
    extractInviteTokenFromPath,
    handleInviteAccept
  } = useInviteProcess();
  
  const {
    isAuthenticated,
    isCheckingAuth,
    handleSignOut,
    handleBackToDashboard
  } = useAuthRedirection(inviteToken);

  // Check and clear any stored auth errors
  useEffect(() => {
    const storedError = localStorage.getItem("auth_error");
    if (storedError) {
      setAuthError(storedError);
      // Clear after reading
      localStorage.removeItem("auth_error");
    }
  }, [setAuthError]);

  // Check if we should default to signup mode based on URL param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("signup") === "true") {
      setIsSignUp(true);
    }

    // Check if this is an invitation link
    extractInviteTokenFromPath(location.pathname);
    
    // Clear any previous errors when changing modes
    setAuthError(null);
  }, [location, extractInviteTokenFromPath, setAuthError]);

  // Enhanced redirect logic to ensure authenticated users are sent to dashboard
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is authenticated, redirecting to dashboard");
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleAuthSuccess = (email: string) => {
    setAuthError(null);
    if (isSignUp) {
      // For new users, redirect to onboarding page
      localStorage.setItem("pending_auth_email", email);
      handleBackToDashboard();
    } else if (inviteToken) {
      // For existing users accepting an invite
      handleInviteAccept(inviteToken, email);
    } else {
      // For existing users, redirect to dashboard
      navigate("/dashboard", { replace: true });
    }
  };

  const handleAuthError = (message: string) => {
    setAuthError(message);
  };

  const handleToggleMode = () => {
    setIsSignUp(!isSignUp);
    setAuthError(null); // Clear errors on toggle
  };

  // Manual redirect to dashboard button
  const handleManualRedirect = async () => {
    try {
      const { data } = await supabase.auth.getSession();
      if (data?.session) {
        navigate("/dashboard", { replace: true });
      } else {
        setAuthError("Please log in first");
      }
    } catch (error) {
      console.error("Error checking auth:", error);
      setAuthError("Error checking authentication status");
    }
  };

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return <AuthLoader title="Checking authentication..." message="Please wait a moment" />;
  }

  // Show loading state while processing invitation
  if (isProcessingInvite) {
    return <AuthLoader title="Processing Invitation" message="Please wait while we verify your invitation..." />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <AuthHeader 
          isSignUp={isSignUp} 
          onBackToDashboard={handleBackToDashboard}
          showBackButton={isAuthenticated} 
        />
        
        <InviteMessage hasInvite={!!inviteToken} />
        
        {isAuthenticated && (
          <>
            <AuthenticatedMessage onSignOut={handleSignOut} />
            <div className="mt-4">
              <button 
                onClick={handleManualRedirect}
                className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md"
              >
                Go to Dashboard
              </button>
            </div>
          </>
        )}
        
        <AuthError message={authError} />
        
        {!isAuthenticated && (
          <AuthForm 
            isSignUp={isSignUp} 
            onSuccess={handleAuthSuccess}
            onError={handleAuthError}
          />
        )}

        {!inviteToken && !isAuthenticated && (
          <AuthToggle 
            isSignUp={isSignUp} 
            onToggle={handleToggleMode} 
          />
        )}
      </div>
    </div>
  );
};

export default Auth;
