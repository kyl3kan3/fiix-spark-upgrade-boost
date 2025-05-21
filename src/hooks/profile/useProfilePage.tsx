
import { useState, useEffect } from "react";
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
  const { profileData, error: profileError, isLoading: profileLoading } = useUserProfile(['role', 'company_id']);
  
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
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    toast.info("Refreshing profile data...");
  };

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUserEmail(user?.email ?? null);
        
        if (!user) {
          console.error("No authenticated user found");
          setError("You must be logged in to view your profile");
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user information");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserEmail();
    
    // Set a timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      if (loading && Date.now() - loadStartTime > 5000) {
        setLoading(false);
        setError("Loading timed out. Please try refreshing.");
      }
    }, 5000);
    
    return () => clearTimeout(timeoutId);
  }, [refreshKey]);

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
