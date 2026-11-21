
import { useState, useEffect, useCallback } from "react";
import { useUserProfile } from "./useUserProfile";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

export const useCurrentUserRole = () => {
 const { profileData, isLoading: isProfileLoading, error: profileError, refreshProfile } = useUserProfile(['role']);
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
 if (profileError) {
 console.error("Error from useUserProfile:", profileError);
 setCurrentUserRole(null);
 setError(new Error(profileError));
 setIsLoading(false);
 return;
 }
 
 const role = profileData?.role || null;
 setCurrentUserRole(role);
 
 if (role) {
 logger.log(`User role loaded: ${role}`);
 setError(null);
 } else if (profileData) {
 // New profiles are created with profiles.role = 'user'; a loaded profile with no
 // role in either user_roles or profiles is missing data, not a safe default.
 logger.log("No role data found for user");
 setCurrentUserRole(null);
 setError(new Error("No role assigned for this account"));
 } else {
 setCurrentUserRole(null);
 }
 
 setIsLoading(false);
 }
 } catch (err) {
 console.error("Error processing user role:", err);
 setCurrentUserRole(null);
 setError(err instanceof Error ? err : new Error("Unknown error processing role data"));
 setIsLoading(false);
 toast.error("Error loading user role data. Please try again.");
 }
 }, [profileData, isProfileLoading, profileError]);

 // Effect to process profile data
 useEffect(() => {
 processProfileData();
 }, [processProfileData]);

 // If profile loading takes too long, set a timeout to prevent infinite loading - reduced to 5 seconds
 useEffect(() => {
 const timeoutId = setTimeout(() => {
 if (isLoading) {
 setIsLoading(false);
 setTimeoutOccurred(true);
 toast.error("Profile data loading timed out. Role permissions are unavailable until refresh.");
 }
 }, 5000); // 5 seconds timeout (reduced from 7)
 
 return () => clearTimeout(timeoutId);
 }, [isLoading]);

 const refreshRole = useCallback(async () => {
 setTimeoutOccurred(false);
 setError(null);
 setIsLoading(true);
 await refreshProfile();
 }, [refreshProfile]);

 return {
 currentUserRole,
 isLoading,
 canEditRoles,
 error,
 timeoutOccurred,
 refreshRole,
 };
};
