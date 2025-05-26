
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData } from "@/components/profile/types";

export function useSimpleProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) {
      setIsLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .maybeSingle();

        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  // Create a proper display name from available data
  const getDisplayName = () => {
    if (!profile && !user) return 'User';
    
    // Try to build name from profile first_name and last_name
    if (profile?.first_name) {
      const fullName = [profile.first_name, profile.last_name].filter(Boolean).join(' ');
      if (fullName.trim()) return fullName;
    }
    
    // Fall back to user metadata if available
    if (user?.user_metadata) {
      const firstName = user.user_metadata.first_name;
      const lastName = user.user_metadata.last_name;
      if (firstName) {
        const fullName = [firstName, lastName].filter(Boolean).join(' ');
        if (fullName.trim()) return fullName;
      }
    }
    
    // Last resort: extract name from email (before @ symbol)
    if (profile?.email) {
      const emailName = profile.email.split('@')[0];
      // Convert email username to a more readable format
      const formattedName = emailName
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      return formattedName;
    }
    
    if (user?.email) {
      const emailName = user.email.split('@')[0];
      const formattedName = emailName
        .replace(/[._-]/g, ' ')
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(' ');
      return formattedName;
    }
    
    return 'User';
  };

  return {
    profile,
    isLoading,
    userName: getDisplayName(),
    companyName: profile?.company_name || '',
    role: profile?.role || 'user'
  };
}
