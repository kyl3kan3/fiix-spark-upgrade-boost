
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useAuthRedirection = (inviteToken: string | null) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

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

  const handleBackToDashboard = () => {
    navigate(isAuthenticated ? "/dashboard" : "/");
  };

  return {
    isAuthenticated,
    isCheckingAuth,
    handleSignOut,
    handleBackToDashboard
  };
};
