
import { useState, useEffect, useRef, useCallback } from "react";
import { useLocation } from "react-router-dom";
import type { User, Session } from "@supabase/supabase-js";
import { shouldDeferAuthBootstrap } from "@/lib/deferAuthBootstrap";

export function useAuthState() {
  const { pathname } = useLocation();
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(() => {
    if (typeof window === "undefined") return false;
    return !shouldDeferAuthBootstrap(window.location.pathname);
  });
  const [error, setError] = useState<string | null>(null);
  const hasResolvedInitialSession = useRef(false);
  const bootstrapStarted = useRef(false);
  const subscriptionRef = useRef<{ unsubscribe: () => void } | null>(null);
  const bootstrapAlive = useRef(true);

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

  const startBootstrap = useCallback(async (showLoading: boolean) => {
    if (bootstrapStarted.current) return;
    bootstrapStarted.current = true;

    if (showLoading) {
      setIsLoading(true);
    }

    const { supabase } = await import("@/integrations/supabase/client");
    if (!bootstrapAlive.current) return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, nextSession) => {
        if (!bootstrapAlive.current) return;

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
    subscriptionRef.current = subscription;

    try {
      const {
        data: { session: existingSession },
        error: sessionError,
      } = await supabase.auth.getSession();
      if (!bootstrapAlive.current) return;

      if (sessionError) {
        console.error("Error restoring session:", sessionError);
        handleError("Failed to restore your session");
        applySession(null);
      } else {
        applySession(existingSession);
      }
    } catch (sessionError) {
      if (!bootstrapAlive.current) return;

      console.error("Unexpected session restore error:", sessionError);
      handleError("Failed to restore your session");
      applySession(null);
    } finally {
      if (bootstrapAlive.current) {
        hasResolvedInitialSession.current = true;
        setIsLoading(false);
      }
    }
  }, [applySession]);

  useEffect(() => {
    bootstrapAlive.current = true;
    if (!shouldDeferAuthBootstrap(window.location.pathname)) {
      void startBootstrap(true);
    }

    return () => {
      bootstrapAlive.current = false;
      subscriptionRef.current?.unsubscribe();
    };
  }, [startBootstrap]);

  useEffect(() => {
    if (bootstrapStarted.current) return;
    if (!shouldDeferAuthBootstrap(pathname)) {
      void startBootstrap(true);
    }
  }, [pathname, startBootstrap]);

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