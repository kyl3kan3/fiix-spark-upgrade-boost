
import { useState, useEffect, useRef, useCallback } from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export function useAuthState() {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const hasResolvedInitialSession = useRef(false);

  // Error handling functions
  const handleError = (errorMessage: string) => {
    setError(errorMessage);
  };

  const clearError = () => {
    setError(null);
  };

  const applySession = useCallback((nextSession: Session | null) => {
    setSession(nextSession);
    setUser(nextSession?.user ?? null);

    if (nextSession) {
      clearError();
    }
  }, []);

  // Logout function
  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('Error signing out:', error);
      handleError('Failed to sign out');
    }
  };

  useEffect(() => {
    let isMounted = true;

    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        if (!isMounted) return;

        applySession(nextSession);

        const isResolvedAuthEvent =
          event === "SIGNED_IN" ||
          event === "SIGNED_OUT" ||
          event === "TOKEN_REFRESHED" ||
          event === "USER_UPDATED" ||
          (event === "INITIAL_SESSION" && !!nextSession);

        if (hasResolvedInitialSession.current || isResolvedAuthEvent) {
          setIsLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession()
      .then(({ data: { session: existingSession }, error: sessionError }) => {
        if (!isMounted) return;

        if (sessionError) {
          console.error("Error restoring session:", sessionError);
          handleError("Failed to restore your session");
          applySession(null);
          return;
        }

        applySession(existingSession);
      })
      .catch((sessionError) => {
        if (!isMounted) return;

        console.error("Unexpected session restore error:", sessionError);
        handleError("Failed to restore your session");
        applySession(null);
      })
      .finally(() => {
        if (!isMounted) return;

        hasResolvedInitialSession.current = true;
        setIsLoading(false);
      });

    return () => {
      isMounted = false;
      subscription.unsubscribe();
    };
  }, [applySession]);

  return {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    error,
    handleError,
    clearError,
    logout
  };
}
