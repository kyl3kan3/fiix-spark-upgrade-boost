
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export function useCompanyAuthentication() {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [profileError, setProfileError] = useState<Error | null>(null);

  // Check authentication status
  const checkAuthStatus = useCallback(async () => {
    try {
      const { data, error } = await supabase.auth.getUser();
      setIsAuthenticated(!!data.user && !error);
    } catch (err) {
      console.error("Error checking auth status:", err);
      setIsAuthenticated(false);
    }
  }, []);

  // Set up auth state listener
  useEffect(() => {
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session?.user?.id ? "authenticated" : "unauthenticated");
      setIsAuthenticated(!!session?.user);
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Refresh auth status
  const refreshAuthStatus = useCallback(async () => {
    setIsLoading(true);
    setProfileError(null);
    
    try {
      await checkAuthStatus();
    } catch (error) {
      console.error("Error refreshing auth status:", error);
      if (error instanceof Error) {
        setProfileError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkAuthStatus]);

  // Initial check
  useEffect(() => {
    refreshAuthStatus();
  }, [refreshAuthStatus]);

  return {
    isLoading,
    isAuthenticated,
    profileError,
    refreshAuthStatus
  };
}
