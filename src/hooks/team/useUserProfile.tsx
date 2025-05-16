
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
        
        // Get profile data from profiles
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select(selectFields)
          .eq('id', user.id)
          .maybeSingle();
          
        if (fetchError) {
          console.error("Error fetching user profile:", fetchError);
          setError("Could not fetch user profile");
          // Always set profileData to null in case of error
          setProfileData(null);
        } else {
          console.log("User profile data:", data);
          
          // Improved null checking - first ensure data exists
          if (data) {
            // Then check if it's an object with a valid company_id property
            // Add explicit non-null assertion for TypeScript
            const profileData = data as Record<string, any>;
            if (typeof profileData === 'object' && 
                'company_id' in profileData && 
                profileData.company_id !== null) {
              // Now it's safe to cast data to UserProfileData
              setProfileData(profileData as UserProfileData);
              setError(null);
            } else {
              console.error("Invalid profile data: missing company_id", data);
              setProfileData(null);
              setError("User must be associated with a company");
            }
          } else {
            console.error("No profile data found, user may need to complete onboarding");
            setProfileData(null);
            setError("User profile data is incomplete. Company association required.");
          }
        }
      } catch (err) {
        console.error("Error in useUserProfile:", err);
        setError("An unexpected error occurred");
        // Always set profileData to null in case of error
        setProfileData(null);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [fields.join(',')]);

  return { profileData, isLoading, error, userId };
};
