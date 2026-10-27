
import { useState, useEffect, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { TeamProfileData, TeamProfileResult } from "../types";
import { logger } from "@/lib/logger";

/**
 * Core hook for team profile data fetching and management
 */
const DEFAULT_PROFILE_FIELDS = ['role', 'company_id', 'company_name'];

export const useTeamProfileCore = (fields: string[] = DEFAULT_PROFILE_FIELDS): TeamProfileResult => {
 const [profileData, setProfileData] = useState<TeamProfileData | null>(null);
 const [userId, setUserId] = useState<string | null>(null);
 const [isLoading, setIsLoading] = useState(true);
 const [error, setError] = useState<string | null>(null);
 const fieldsKey = fields.join("\u0000");
 const selectFields = useMemo(() => {
 const requestedFields = fieldsKey ? fieldsKey.split("\u0000") : [];
 return [...new Set([...requestedFields, 'company_id'])].join(', ');
 }, [fieldsKey]);
 
 const fetchUserProfile = useCallback(async (): Promise<any | null> => {
 try {
 setIsLoading(true);
 setError(null);
 
 const { data: { user }, error: userError } = await supabase.auth.getUser();
 
 if (userError) {
 if (userError.message.includes("Auth session missing")) {
 setError("Please log in to access this feature");
 setProfileData(null);
 setUserId(null);
 setIsLoading(false);
 return null;
 }
 
 console.error("Auth error when getting user:", userError);
 setError("Authentication error: " + userError.message);
 setProfileData(null);
 setIsLoading(false);
 return null;
 }
 
 if (!user) {
 setProfileData(null);
 setUserId(null);
 setIsLoading(false);
 return null;
 }
 
 setUserId(user.id);
 
 const { data, error: fetchError } = await supabase
 .from('profiles')
 .select(selectFields)
 .eq('id', user.id)
 .maybeSingle();
 
 if (fetchError) {
 console.error("Error fetching user profile:", fetchError);
 setError("Could not fetch user profile: " + fetchError.message);
 setProfileData(null);
 setIsLoading(false);
 return null;
 }

 if (!data) {
 setError("No profile found for user");
 setProfileData(null);
 setIsLoading(false);
 return null;
 }

 const { data: roleData, error: roleError } = await supabase
 .from('user_roles')
 .select('role')
 .eq('user_id', user.id)
 .maybeSingle();

 if (roleError) {
 console.error("Error fetching user role:", roleError);
 }

 const userRole = roleData?.role || (data as any).role || null;
 
 if (typeof data === 'object' && data !== null) {
 const typedData = data as Record<string, any>;
 
 if ('company_id' in typedData && typedData.company_id !== null && typedData.company_id !== undefined) {
 const profileData: TeamProfileData = {
 role: userRole,
 company_id: String(typedData.company_id),
 company_name: typedData.company_name,
 first_name: typedData.first_name,
 last_name: typedData.last_name,
 ...typedData
 };
 setProfileData(profileData);
 setError(null);
 } else {
 logger.warn("Invalid profile data: missing company_id", data);
 setError("Profile missing required company information");
 setProfileData(null);
 }
 } else {
 logger.warn("Invalid profile data format:", data);
 setError("Invalid profile data format");
 setProfileData(null);
 }
 
 setIsLoading(false);
 return data;
 } catch (err) {
 console.error("Error in useTeamProfile:", err);
 setError("An unexpected error occurred: " + (err as Error).message);
 setProfileData(null);
 setIsLoading(false);
 return null;
 }
 }, [selectFields]);
 
 const refreshProfile = useCallback(async () => {
 return await fetchUserProfile();
 }, [fetchUserProfile]);

 useEffect(() => {
 let mounted = true;
 
 const doFetch = async () => {
 if (mounted) {
 await fetchUserProfile();
 }
 };
 
 doFetch();
 
 return () => {
 mounted = false;
 };
 }, [fetchUserProfile]);

 const role = profileData?.role || null;
 const isAdmin = role === 'administrator';
 const companyName = profileData?.company_name;

 return { 
 profileData, 
 isLoading, 
 error, 
 userId,
 role,
 isAdmin,
 companyName,
 refreshProfile
 };
};
