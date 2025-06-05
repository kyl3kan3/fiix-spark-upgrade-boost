
import { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useUserProfile } from "@/hooks/team/useUserProfile";

export const useProfilePage = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loadStartTime] = useState(Date.now());
  const [refreshKey, setRefreshKey] = useState(0);
  const navigate = useNavigate();
  const location = useLocation();
  const { 
    profileData, 
    error: profileError, 
    isLoading: profileLoading, 
    refreshProfile 
  } = useUserProfile(['role', 'company_id', 'company_name', 'first_name', 'last_name']);
  
  // Extract the tab from the URL search params
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'settings' ? 'settings' : 'profile');

  // Update URL when tab changes without page reload
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update the URL without full page reload
    const newUrl = value === 'settings' 
      ? '/profile?tab=settings' 
      : '/profile';
      
    // Use navigate with replace option to avoid adding to history
    navigate(newUrl, { replace: true });
  };

  // Handle refreshing the profile data
  const handleRefresh = useCallback(() => {
    setRefreshKey(prev => prev + 1);
    setError(null);
    setLoading(true);
    refreshProfile();
    toast.info("Refreshing profile data...");
  }, [refreshProfile]);

  // Check authentication and load user data
  useEffect(() => {
    let isMounted = true;
    const fetchUserData = async () => {
      try {
        if (isMounted) setLoading(true);
        if (isMounted) setError(null);
        
        console.log("Fetching user data for profile page");
        
        // Get current user directly without using hooks
        const { data, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          console.error("Auth error in profile page:", userError);
          if (isMounted) setError("Authentication error: " + userError.message);
          navigate("/auth", { replace: true });
          return;
        }
        
        if (!data.user) {
          console.error("No authenticated user found in profile page");
          if (isMounted) setError("You must be logged in to view your profile");
          navigate("/auth", { replace: true });
          return;
        }
        
        if (isMounted) setUserEmail(data.user?.email ?? null);
        console.log("User email loaded:", data.user?.email);
        
      } catch (err) {
        console.error("Error in profile page initialization:", err);
        if (isMounted) setError("Failed to load user information");
      } finally {
        if (isMounted) setLoading(false);
      }
    };
    
    fetchUserData();
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (isMounted && loading && Date.now() - loadStartTime > 5000) {
        console.warn("Loading timeout in profile page");
        setLoading(false);
        setError("Loading timed out. Please try refreshing.");
      }
    }, 5000);
    
    return () => {
      isMounted = false;
      clearTimeout(timeoutId);
    };
  }, [refreshKey, navigate, loading, loadStartTime]);

  // Effect to update active tab when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    setActiveTab(tabFromUrl === 'settings' ? 'settings' : 'profile');
  }, [location.search]);

  return {
    userEmail,
    loading,
    error,
    activeTab,
    handleTabChange,
    handleRefresh,
    refreshKey,
    profileData,
    profileError,
    profileLoading
  };
};
