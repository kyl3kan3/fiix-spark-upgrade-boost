import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import AuthForm from "@/components/auth/AuthForm";
import AuthError from "@/components/auth/AuthError";
import AuthToggle from "@/components/auth/AuthToggle";
import AuthHeader from "@/components/auth/AuthHeader";
import { toast } from "sonner";

const Auth = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSignUp, setIsSignUp] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [inviteToken, setInviteToken] = useState<string | null>(null);
  const [isProcessingInvite, setIsProcessingInvite] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [hasAttemptedRedirect, setHasAttemptedRedirect] = useState(false);

  useEffect(() => {
    let isMounted = true;
    
    // Check if we should default to signup mode based on URL param
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

    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Auth state change in Auth.tsx:", event);
        if (!isMounted) return;
        
        const isAuthed = !!session?.user;
        setIsAuthenticated(isAuthed);
        
        if (isAuthed && isInitialized && !inviteToken && !hasAttemptedRedirect) {
          // Only redirect once to prevent loops
          setHasAttemptedRedirect(true);
          console.log("User is authenticated, redirecting to dashboard");
          
          // Use a slight delay to ensure all state is updated
          setTimeout(() => {
            navigate("/dashboard", { replace: true });
          }, 100);
        }
      }
    );

    // THEN check for existing session
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        if (error) {
          console.error("Error checking session in Auth.tsx:", error);
          return;
        }
        
        if (data?.session?.user) {
          if (!isMounted) return;
          setIsAuthenticated(true);
          
          if (inviteToken) {
            // Process invite for logged in user
            handleInviteAccept(inviteToken, data.session.user.email || "");
          } else if (isInitialized && !hasAttemptedRedirect) {
            // Only redirect once to prevent loops
            setHasAttemptedRedirect(true);
            console.log("Existing session found, redirecting to dashboard");
            
            // Use a slight delay to ensure all state is updated
            setTimeout(() => {
              navigate("/dashboard", { replace: true });
            }, 100);
          }
        } else {
          if (!isMounted) return;
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error("Exception during session check in Auth.tsx:", err);
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    };
    
    checkSession();
    
    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [location, navigate, inviteToken, isInitialized, hasAttemptedRedirect]);

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
      navigate("/onboarding", { replace: true });
      
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
      navigate("/onboarding", { replace: true });
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

  // Show loading state while processing invitation
  if (isProcessingInvite) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full bg-white p-10 rounded-lg shadow-md text-center">
          <h1 className="text-xl font-semibold mb-4">Processing Invitation</h1>
          <p className="text-gray-500">Please wait while we verify your invitation...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-lg shadow-md">
        <AuthHeader 
          isSignUp={isSignUp} 
          onBackToDashboard={() => navigate("/dashboard", { replace: true })}
          showBackButton={isAuthenticated} // Only show back button if authenticated
        />
        
        {inviteToken && (
          <div className="bg-blue-50 border border-blue-200 rounded-md p-4 mb-4">
            <p className="text-blue-700">
              You're accepting an invitation to join a company.
            </p>
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
