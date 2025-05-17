
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useCompanyStatus() {
  const [isLoading, setIsLoading] = useState(true);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [setupComplete, setSetupComplete] = useState<boolean | null>(null);
  const [profileError, setProfileError] = useState<Error | null>(null);

  // Check if user has completed setup
  const checkSetupCompleted = () => {
    const setupCompleted = localStorage.getItem('maintenease_setup_complete');
    return setupCompleted === 'true';
  };

  // Load profile data
  const loadProfileData = async () => {
    try {
      setIsLoading(true);
      
      // Get current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        console.log("No authenticated user found");
        return null;
      }

      // Load profile data
      const { data: profile, error } = await supabase
        .from("profiles")
        .select("company_id, role")
        .eq("id", user.id)
        .single();
      
      if (error) {
        console.error("Error loading profile:", error);
        setProfileError(new Error(error.message));
        return null;
      }
      
      return profile;
    } catch (error) {
      console.error("Error in loading profile data:", error);
      if (error instanceof Error) {
        setProfileError(error);
      } else {
        setProfileError(new Error('Unknown error loading profile data'));
      }
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const refreshCompanyStatus = async () => {
    // Reset state for refresh
    setIsLoading(true);
    setProfileError(null);
    
    try {
      // Check setup status
      const isSetupComplete = checkSetupCompleted();
      setSetupComplete(isSetupComplete);
      
      // Load profile data
      const profile = await loadProfileData();
      
      if (profile?.company_id) {
        setCompanyId(profile.company_id);
        console.log("Company ID found in profile:", profile.company_id);
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
  };

  // Initial load
  useEffect(() => {
    refreshCompanyStatus();
  }, []);

  const handleCompanyFound = (newCompanyId: string) => {
    setCompanyId(newCompanyId);
    localStorage.setItem('maintenease_setup_complete', 'true');
    setSetupComplete(true);
  };

  return {
    isLoading,
    profileError,
    setupComplete,
    companyId,
    refreshCompanyStatus,
    handleCompanyFound
  };
}
