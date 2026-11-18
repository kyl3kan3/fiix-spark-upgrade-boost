
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";
import { shouldDeferAuthBootstrap, scheduleIdleTask } from "@/lib/deferAuthBootstrap";

export function useAuthState() {
  const { pathname } = useLocation();
  const deferBootstrap = shouldDeferAuthBootstrap(pathname);
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") return true;
    return !shouldDeferAuthBootstrap(window.location.pathname);
  });
  const [error, setError] = useState<string | null>(null);
  const hasResolvedInitialSession = useRef(false);
  const bootstrapGeneration = useRef(0);

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

  const logout = async () => {
    try {
      const { supabase } = await import("@/integrations/supabase/client");
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error("Error signing out:", error);
      handleError("Failed to sign out");
    }
  };

  useEffect(() => {
    const generation = ++bootstrapGeneration.current;
    let isMounted = true;
    let cancelScheduled: (() => void) | undefined;
    let subscription: { unsubscribe: () => void } | null = null;

    const finishBootstrap = () => {
      if (!isMounted) return;
      hasResolvedInitialSession.current = true;
      setIsLoading(false);
    };

    const startBootstrap = async () => {
      if (!deferBootstrap) {
        setIsLoading(true);
      }

      const { supabase } = await import("@/integrations/supabase/client");
      if (!isMounted || generation !== bootstrapGeneration.current) return;

      const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
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
        },
      );
      subscription = authSub;

      try {
        const { data: { session: existingSession }, error: sessionError } = await supabase.auth.getSession();
        if (!isMounted || generation !== bootstrapGeneration.current) return;

        if (sessionError) {
          console.error("Error restoring session:", sessionError);
          handleError("Failed to restore your session");
          applySession(null);
        } else {
          applySession(existingSession);
        }
      } catch (sessionError) {
        if (!isMounted || generation !== bootstrapGeneration.current) return;

        console.error("Unexpected session restore error:", sessionError);
        handleError("Failed to restore your session");
        applySession(null);
      } finally {
        finishBootstrap();
      }
    };

    const run = () => {
      void startBootstrap();
    };

    if (deferBootstrap) {
      cancelScheduled = scheduleIdleTask(run);
    } else {
      run();
    }

    return () => {
      isMounted = false;
      cancelScheduled?.();
      subscription?.unsubscribe();
    };
  }, [deferBootstrap, pathname, applySession]);

  return {
    user,
    session,
    isAuthenticated: !!user,
    isLoading,
    error,
    handleError,
    clearError,
    logout,
  };
}