
import React, { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCompanyStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [profileError, setProfileError] = useState<Error | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  // Check if user has completed setup
  const checkSetupCompleted = useCallback(() => {
    const setupCompleted = localStorage.getItem('maintenease_setup_complete');
    const result = setupCompleted === 'true';
    console.log("Setup completed check from localStorage:", result);
    return result;
  }, []);

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getUser();
        setIsAuthenticated(!!data.user && !error);
      } catch (err) {
        console.error("Error checking auth status:", err);
        setIsAuthenticated(false);
      }
    };
    
    checkAuth();
    
    const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change:", event, session?.user?.id ? "authenticated" : "unauthenticated");
      setIsAuthenticated(!!session?.user);
      
      if (event === 'SIGNED_IN') {
        // Re-check company status when user signs in
        refreshCompanyStatus();
      } else if (event === 'SIGNED_OUT') {
        // Clear company data when user signs out
        setCompanyId(null);
      }
    });
    
    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Load profile data
  const loadProfileData = useCallback(async () => {
    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Auth error when getting user:", userError);
        setProfileError(new Error("Authentication error: " + userError.message));
        return null;
      }
      
      if (!user) {
        console.log("No authenticated user found");
        setProfileError(new Error("No authenticated user found. Please sign in."));
        return null;
      }

      console.log("Loading profile for user ID:", user.id);

      // Load profile data
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("company_id, role, email")
        .eq("id", user.id)
        .maybeSingle();
      
      if (error) {
        console.error("Error loading profile:", error);
        setProfileError(new Error(error.message));
        return null;
      }
      
      console.log("Profile loaded:", profile);
      
      return profile;
    } catch (error) {
      console.error("Error in loading profile data:", error);
      if (error instanceof Error) {
        setProfileError(error);
      } else {
        setProfileError(new Error('Unknown error loading profile data'));
      }
      return null;
    }
  }, []);

  const refreshCompanyStatus = useCallback(async () => {
    // Reset state for refresh
    setIsLoading(true);
    setProfileError(null);
    
    try {
      // Check setup status
      const isSetupComplete = checkSetupCompleted();
      setSetupComplete(isSetupComplete);
      console.log("Setup complete status:", isSetupComplete);
      
      // Check authentication
      const { data } = await supabase.auth.getUser();
      if (!data.user) {
        console.log("No authenticated user found in refreshCompanyStatus");
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }
      
      setIsAuthenticated(true);
      
      // Load profile data
      const profile = await loadProfileData();
      
      if (profile?.company_id) {
        setCompanyId(profile.company_id);
        console.log("Company ID found in profile:", profile.company_id);
        
        // If we find a company ID, make sure setup is marked as complete
        if (!isSetupComplete) {
          localStorage.setItem('maintenease_setup_complete', 'true');
          setSetupComplete(true);
          console.log("Setup marked as complete because company ID exists in profile");
        }
      } else {
        setCompanyId(null);
        console.log("No company ID found in profile");
      }
    } catch (error) {
      console.error("Error refreshing company status:", error);
      if (error instanceof Error) {
        setProfileError(error);
      } else {
        setProfileError(new Error('Unknown error refreshing company status'));
      }
    } finally {
      setIsLoading(false);
    }
  }, [checkSetupCompleted, loadProfileData]);

  // Initial load
  useEffect(() => {
    console.log("Initial load of company status");
    refreshCompanyStatus();
  }, [refreshCompanyStatus]);

  const handleCompanyFound = useCallback((newCompanyId: string) => {
    setCompanyId(newCompanyId);
    localStorage.setItem('maintenease_setup_complete', 'true');
    setSetupComplete(true);
    console.log("Company found and setup marked complete:", newCompanyId);
    
    toast.success("Company setup completed");
    
    // Force refresh the page after a short delay to ensure all state is updated
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 1000);
  }, []);

  return {
    isLoading,
    profileError,
    setupComplete,
    companyId,
    isAuthenticated,
    refreshCompanyStatus,
    handleCompanyFound
  };
}
