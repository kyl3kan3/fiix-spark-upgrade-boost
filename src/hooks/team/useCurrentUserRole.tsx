
import { useState, useEffect, useCallback } from "react";
import { useUserProfile } from "./useUserProfile";
import { toast } from "sonner";

export const useCurrentUserRole = () => {
  const { profileData, isLoading: isProfileLoading } = useUserProfile(['role']);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [timeoutOccurred, setTimeoutOccurred] = useState(false);
  
  // Determine if the current user can edit roles (only administrators can)
  const canEditRoles = currentUserRole === 'administrator';

  // Callback for processing profile data
  const processProfileData = useCallback(() => {
    try {
      if (!isProfileLoading) {
        const role = profileData?.role || null;
        setCurrentUserRole(role);
        
        if (role) {
          console.log(`User role loaded: ${role}`);
        } else {
          console.log("No role data found for user");
        }
        
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error processing user role:", err);
      setError(err instanceof Error ? err : new Error("Unknown error processing role data"));
      setIsLoading(false);
      
      // Show toast for error
      toast.error("Error loading user role data");
    }
  }, [profileData, isProfileLoading]);

  // Effect to process profile data
  useEffect(() => {
    processProfileData();
  }, [processProfileData]);

  // If profile loading takes too long, set a timeout to prevent infinite loading - reduced from 10 to 7 seconds
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setTimeoutOccurred(true);
        toast.error("Profile data loading timed out. Using default access level.");
        
        // Set a default role to prevent blocking the UI completely
        setCurrentUserRole('user');
      }
    }, 7000); // 7 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  return {
    currentUserRole,
    isLoading,
    canEditRoles,
    error,
    timeoutOccurred
  };
};
