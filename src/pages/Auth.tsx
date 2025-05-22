import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthForm from "@/components/auth/AuthForm";
import AuthError from "@/components/auth/AuthError";
import AuthToggle from "@/components/auth/AuthToggle";
import AuthHeader from "@/components/auth/AuthHeader";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button"; // Add this import for the Button component

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [isProcessingInvite, setIsProcessingInvite] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  // Check and clear any stored auth errors
  useEffect(() => {
    const storedError = localStorage.getItem("auth_error");
    if (storedError) {
      setAuthError(storedError);
      // Clear after reading
      localStorage.removeItem("auth_error");
    }
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const checkSession = async () => {
      try {
        setIsCheckingAuth(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking auth session:", error);
          setIsAuthenticated(false);
        } else if (data.session) {
          console.log("User is already authenticated:", data.session.user.id);
          setIsAuthenticated(true);
          
          // If not on invite flow, redirect to dashboard
          if (!inviteToken) {
            navigate("/dashboard");
          }
        } else {
          console.log("No active session found");
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Unexpected error during auth check:", err);
        setIsAuthenticated(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };
    
    checkSession();
    
    // Set up auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change in Auth page:", event, session?.user?.id ? "authenticated" : "unauthenticated");
      setIsAuthenticated(!!session?.user);
      
      if (event === 'SIGNED_IN' && !inviteToken) {
        navigate("/dashboard");
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, [navigate, inviteToken]);

  // Check if we should default to signup mode based on URL param
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("signup") === "true") {
      setIsSignUp(true);
    }

    // Check if this is an invitation link
    const path = location.pathname;
    if (path.startsWith("/invite/")) {
      const token = path.replace("/invite/", "");
      if (token) {
        setInviteToken(token);
        setIsSignUp(true);
        handleInviteToken(token);
      }
    }
    
    // Clear any previous errors when changing modes
    setAuthError(null);
  }, [location]);

  const handleInviteToken = async (token: string) => {
    setIsProcessingInvite(true);
    try {
      // Look up the invitation
      const { data: invitation, error } = await supabase
        .from("organization_invitations")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .maybeSingle();
        
      if (error) {
        throw error;
      }
      
      if (!invitation) {
        setAuthError("Invalid or expired invitation link");
        return;
      }
      
      // Store the email to pre-fill the form
      if (invitation.email) {
        localStorage.setItem("pending_auth_email", invitation.email);
      }
      
      toast.info("Please sign up to accept the invitation");
      
    } catch (error) {
      console.error("Error processing invite:", error);
      setAuthError("Error processing invitation");
    } finally {
      setIsProcessingInvite(false);
    }
  };

  const handleInviteAccept = async (token: string, email: string) => {
    try {
      // Find the invitation
      const { data: invitation, error } = await supabase
        .from("organization_invitations")
        .select("*")
        .eq("token", token)
        .eq("status", "pending")
        .maybeSingle();
        
      if (error || !invitation) {
        throw new Error("Invalid or expired invitation");
      }
      
      // Check if the email matches
      if (invitation.email.toLowerCase() !== email.toLowerCase()) {
        throw new Error("This invitation is for a different email address");
      }
      
      // Update invitation status
      localStorage.setItem("pending_invitation", JSON.stringify(invitation));
      
      // Redirect to onboarding to complete the process
      navigate("/onboarding");
      
    } catch (error: any) {
      console.error("Error accepting invitation:", error);
      toast.error(error.message || "Failed to process invitation");
    }
  };

  const handleAuthSuccess = (email: string) => {
    setAuthError(null);
    if (isSignUp) {
      // For new users, redirect to onboarding page
      localStorage.setItem("pending_auth_email", email);
      navigate("/onboarding");
    } else if (inviteToken) {
      // For existing users accepting an invite
      handleInviteAccept(inviteToken, email);
    } else {
      // For existing users, redirect to dashboard
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

  const handleBackToDashboard = () => {
    navigate(isAuthenticated ? "/dashboard" : "/");
  };

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      setIsAuthenticated(false);
      toast.info("You have been signed out");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out");
    }
  };

  // Show loading state while checking auth
  if (isCheckingAuth) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-md text-center">
          <h1 className="text-xl font-semibold mb-4">Checking authentication...</h1>
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-maintenease-600" />
          <p className="text-gray-500 mt-4">Please wait a moment</p>
        </div>
      </div>
    );
  }

  // Show loading state while processing invitation
  if (isProcessingInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-md text-center">
          <h1 className="text-xl font-semibold mb-4">Processing Invitation</h1>
          <Loader2 className="animate-spin h-8 w-8 mx-auto text-maintenease-600" />
          <p className="text-gray-500 mt-4">Please wait while we verify your invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <AuthHeader 
          isSignUp={isSignUp} 
          onBackToDashboard={handleBackToDashboard}
          showBackButton={isAuthenticated} // Only show back button if authenticated
        />
        
        {inviteToken && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <p className="text-blue-700">
              You're accepting an invitation to join a company.
            </p>
          </div>
        )}
        
        {isAuthenticated && (
          <div className="bg-green-50 border border-green-200 rounded-md p-4 mb-4">
            <p className="text-green-700">
              You are already signed in.
            </p>
            <div className="mt-2 flex justify-between">
              <Button 
                variant="outline" 
                className="text-sm"
                onClick={() => navigate("/dashboard")}
              >
                Go to Dashboard
              </Button>
              <Button 
                variant="outline" 
                className="text-sm text-red-500 border-red-200"
                onClick={handleSignOut}
              >
                Sign Out
              </Button>
            </div>
          </div>
        )}
        
        <AuthError message={authError} />
        
        <AuthForm 
          isSignUp={isSignUp} 
          onSuccess={handleAuthSuccess}
          onError={handleAuthError}
        />

        {!inviteToken && (
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
