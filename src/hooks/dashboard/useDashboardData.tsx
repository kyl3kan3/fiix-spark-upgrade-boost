
import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useProfile } from "@/hooks/profile/useProfile";
import { toast } from "sonner";

export function useDashboardData() {
  const { user, isLoading: authLoading } = useAuth();
  const { profileData, isLoading: profileLoading, error: profileError } = useProfile();
  const [loadingError, setLoadingError] = useState<string | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMounted = useRef(true);

  // Clear timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      isMounted.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  // Set up timeout for data loading
  useEffect(() => {
    const isLoading = authLoading || profileLoading;
    
    if (isLoading) {
      // Clear any existing timeout
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      
      timeoutRef.current = setTimeout(() => {
        if (isMounted.current && isLoading) {
          console.log("Dashboard data loading timeout triggered");
          setLoadingError("Loading timed out. Please refresh the page.");
          toast.error("Loading timed out", {
            description: "Dashboard data couldn't be loaded. Please refresh and try again."
          });
        }
      }, 10000); // 10 seconds timeout
    } else {
      // If we're not loading anymore, clear the timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    }
    
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [authLoading, profileLoading]);

  // Handle profile errors
  useEffect(() => {
    if (profileError) {
      setLoadingError(`Error loading profile: ${profileError}`);
    } else {
      setLoadingError(null);
    }
  }, [profileError]);

  // Extract user information from profile data
  const userName = profileData 
    ? [profileData.first_name, profileData.last_name].filter(Boolean).join(" ") || profileData.email || "User"
    : user?.email || "User";
    
  const companyName = profileData?.company_name || "";
  const role = profileData?.role || "User";

  return {
    userName,
    companyName,
    role,
    isLoading: authLoading || profileLoading,
    loadingError: loadingError || profileError
  };
}
