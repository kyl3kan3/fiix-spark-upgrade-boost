
import { useState, useEffect } from "react";
import { useTeamPresence } from "./team/useTeamPresence";
import { useTeamData } from "./team/useTeamData";
import { useTeamUpdates } from "./team/useTeamUpdates";
import { useTeamEvents } from "./team/useTeamEvents";
import { ChatUser } from "@/types/chat";

/**
 * Combined hook for team members functionality
 * This hook integrates all the separate team-related hooks into one easy-to-use interface
 */
export const useTeamMembers = () => {
  // Get online users status from presence hook
  const { onlineUsers } = useTeamPresence();
  
  // Get team members data
  const { teamMembers, setTeamMembers, loading, fetchTeamMembers } = useTeamData(onlineUsers);
  
  // Get team update functionality
  const { updateTeamMember } = useTeamUpdates(setTeamMembers);
  
  // Setup event listeners for real-time updates
  const { refreshTeamMembers } = useTeamEvents(fetchTeamMembers);
  
  // Fetch team members on mount
  useEffect(() => {
    console.log("useTeamMembers hook: Initial fetch of team members");
    fetchTeamMembers();
  }, [fetchTeamMembers]);
  
  return {
    teamMembers,
    loading,
    refreshTeamMembers,
    updateTeamMember
  };
};
