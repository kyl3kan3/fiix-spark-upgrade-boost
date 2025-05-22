
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Hook for managing authentication state
 */
export const useAuthState = () => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [authError, setAuthError] = useState<string | null>(null);

  // Check authentication status on mount
  useEffect(() => {
    let mounted = true;
    let authSubscription = null;
    
    const checkAuth = async () => {
      try {
        console.log("Checking auth status...");
        
        // Set up auth state listener first
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, currentSession) => {
          console.log(`Auth state change: ${event}`, currentSession?.user?.id);
          
          if (mounted) {
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
            setIsAuthenticated(!!currentSession?.user);
          }
          
          if (event === 'SIGNED_IN') {
            console.log("User signed in:", currentSession?.user.id);
            toast.success("Successfully signed in!");
          } else if (event === 'SIGNED_OUT') {
            console.log("User signed out");
            toast.info("Signed out");
          } else if (event === 'USER_UPDATED') {
            console.log("User updated");
            setSession(currentSession);
            setUser(currentSession?.user ?? null);
          }
        });
        
        authSubscription = subscription;
        
        // Then check for existing session
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking auth session:", error);
          throw error;
        }
        
        if (mounted) {
          const authenticated = !!data.session;
          setIsAuthenticated(authenticated);
          setSession(data.session);
          setUser(data.session?.user ?? null);
          
          console.log(
            authenticated 
              ? `Auth initialized with session for user: ${data.session.user.id}` 
              : "Auth initialized with no active session"
          );
        }
        
      } catch (err) {
        console.error("Error checking auth status:", err);
        if (mounted) {
          setIsAuthenticated(false);
          setAuthError(err instanceof Error ? err.message : "Unknown authentication error");
        }
      }
    };
    
    checkAuth();
    
    return () => {
      mounted = false;
      if (authSubscription) {
        authSubscription.unsubscribe();
      }
    };
  }, []);

  return {
    isAuthenticated,
    user,
    session,
    authError,
    setAuthError
  };
};
