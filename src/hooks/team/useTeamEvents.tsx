
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTeamEvents = (fetchTeamMembers: () => Promise<void>) => {
  useEffect(() => {
    // Create a channel to listen for new messages
    const messageChannel = supabase
      .channel('public:messages')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'messages'
        },
        () => {
          fetchTeamMembers();
        })
      .subscribe();

    // Create a channel to listen for profile changes
    const profileChannel = supabase
      .channel('public:profiles')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'profiles'
        },
        () => {
          fetchTeamMembers();
        })
      .subscribe();

    return () => {
      supabase.removeChannel(messageChannel);
      supabase.removeChannel(profileChannel);
    };
  }, [fetchTeamMembers]);

  // Force refresh function that can be called to refresh team members
  const refreshTeamMembers = useCallback(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return { refreshTeamMembers };
};
