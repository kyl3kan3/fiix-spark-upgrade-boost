
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export const useSimpleAuthRedirection = (inviteToken: string | null) => {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState(true);

  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking auth session:", error);
          setIsAuthenticated(false);
        } else if (data.session) {
          setIsAuthenticated(true);
          if (!inviteToken) {
            navigate("/dashboard");
          }
        } else {
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
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
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

  return {
    isAuthenticated,
    isCheckingAuth,
    handleSignOut
  };
};
