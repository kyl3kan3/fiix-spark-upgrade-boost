
import { useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTeamEvents = (fetchTeamMembers: () => Promise<void>) => {
  useEffect(() => {
    console.log("Setting up team events listeners");

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
          // When any message changes, refresh the unread counts
          console.log("Message table changed, refreshing team members");
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
          console.log("Profile table changed, refreshing team members");
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
    console.log("Manually triggering team members refresh");
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return { refreshTeamMembers };
};
