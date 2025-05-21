
import { useState, useEffect } from "react";
import { useUserProfile } from "./useUserProfile";
import { toast } from "sonner";

export const useCurrentUserRole = () => {
  const { profileData, isLoading: isProfileLoading } = useUserProfile(['role']);
  const [isLoading, setIsLoading] = useState(true);
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  // Determine if the current user can edit roles (only administrators can)
  const canEditRoles = currentUserRole === 'administrator';

  useEffect(() => {
    try {
      if (!isProfileLoading) {
        setCurrentUserRole(profileData?.role || null);
        setIsLoading(false);
      }
    } catch (err) {
      console.error("Error processing user role:", err);
      setError(err instanceof Error ? err : new Error("Unknown error processing role data"));
      setIsLoading(false);
    }
  }, [profileData, isProfileLoading]);

  // If profile loading takes too long, set a timeout to prevent infinite loading
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        toast.error("Profile data loading timed out. Please refresh the page.");
      }
    }, 10000); // 10 seconds timeout
    
    return () => clearTimeout(timeoutId);
  }, [isLoading]);

  return {
    currentUserRole,
    isLoading,
    canEditRoles,
    error
  };
};
