
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfileData {
  role: string | null;
  company_name?: string;
  company_id: string; // Now required since we've made it non-nullable
  first_name?: string;
  last_name?: string;
  [key: string]: any;
}

interface UserProfileResult {
  profileData: UserProfileData | null;
  isLoading: boolean;
  error: string | null;
  userId: string | null;
}

export const useUserProfile = (fields: string[] = ['role', 'company_id']): UserProfileResult => {
  const [profileData, setProfileData] = useState<UserProfileData | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log("No authenticated user found");
          setProfileData(null);
          setUserId(null);
          setIsLoading(false);
          return;
        }
        
        setUserId(user.id);
        console.log("Fetching profile for user ID:", user.id);
        
        // Make sure company_id is always included in the fields
        const fieldsToFetch = fields.includes('company_id') 
          ? fields 
          : [...fields, 'company_id'];
        
        // Build the select query with requested fields
        const selectFields = fieldsToFetch.join(', ');
        
        // Get profile data from profiles - use maybeSingle() to handle case where profile doesn't exist
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select(selectFields)
          .eq('id', user.id)
          .maybeSingle();
          
        if (fetchError) {
          console.error("Error fetching user profile:", fetchError);
          setError("Could not fetch user profile");
          setProfileData(null);
        } else {
          console.log("User profile data:", data);
          
          if (!data) {
            // Handle case where no profile data was found
            console.warn("No profile data found, user may need to complete onboarding");
            setProfileData(null);
            setError("User profile data is incomplete. Setup process required.");
            return;
          }
          
          // TypeScript safe check - first ensure data exists and is an object
          if (data && typeof data === 'object') {
            // Then check for company_id property
            const profileData = data as Record<string, any>;
            if ('company_id' in profileData && profileData.company_id !== null) {
              // Safe to cast to UserProfileData since we've verified the key property
              setProfileData(profileData as UserProfileData);
              setError(null);
            } else {
              console.warn("Invalid profile data: missing company_id", data);
              setProfileData(null);
              setError("User needs to complete setup");
            }
          } else {
            setProfileData(null);
            setError("Invalid profile data format");
          }
        }
      } catch (err) {
        console.error("Error in useUserProfile:", err);
        setError("An unexpected error occurred");
        setProfileData(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [fields.join(',')]);

  return { profileData, isLoading, error, userId };
};
