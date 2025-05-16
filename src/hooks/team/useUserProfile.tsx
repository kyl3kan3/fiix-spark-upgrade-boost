
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface UserProfileData {
  role: string | null;
  company_name?: string;
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

export const useUserProfile = (fields: string[] = ['role']): UserProfileResult => {
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
        
        // Build the select query with requested fields
        const selectFields = fields.join(', ');
        
        // Get profile data from profiles
        const { data, error: fetchError } = await supabase
          .from('profiles')
          .select(selectFields)
          .eq('id', user.id)
          .maybeSingle();
          
        if (fetchError) {
          console.error("Error fetching user profile:", fetchError);
          setError("Could not fetch user profile");
          setProfileData(null); // Set to null instead of passing the error object
        } else {
          console.log("User profile data:", data);
          setProfileData(data || null);
          setError(null);
        }
      } catch (err) {
        console.error("Error in useUserProfile:", err);
        setError("An unexpected error occurred");
        setProfileData(null); // Set to null instead of passing the error object
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchUserProfile();
  }, [fields.join(',')]);

  return { profileData, isLoading, error, userId };
};
