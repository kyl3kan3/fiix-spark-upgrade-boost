
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatUser } from "@/types/chat";
import { toast } from "sonner";

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching team members...", new Date().toISOString());
      
      // Get current user
      const { data: currentUserData, error: userError } = await supabase.auth.getUser();
      
      if (userError) {
        console.error("Error getting current user:", userError);
        throw userError;
      }
      
      const currentUserId = currentUserData?.user?.id;

      if (!currentUserId) {
        console.error("No current user found");
        return;
      }

      // Fetch all profiles except current user
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("*")
        .neq("id", currentUserId);

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }
      
      console.log("Fetched profiles:", profiles);
      
      // Count unread messages for each user
      const users = await Promise.all(profiles.map(async (profile) => {
        const { count, error: countError } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("sender_id", profile.id)
          .eq("recipient_id", currentUserId)
          .eq("read", false);

        if (countError) {
          console.error("Error counting unread messages:", countError);
          return null;
        }

        const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
        const displayName = fullName || profile.email;

        return {
          id: profile.id,
          name: displayName,
          email: profile.email,
          role: profile.role || "viewer",
          avatar: profile.avatar_url ? profile.avatar_url : (displayName.substring(0, 2).toUpperCase()),
          online: false,  // We'll set this to false for now
          unread: count || 0,
          firstName: profile.first_name || '',
          lastName: profile.last_name || ''
        };
      }));

      const filteredUsers = users.filter(Boolean) as ChatUser[];
      console.log("Processed team members:", filteredUsers);
      setTeamMembers(filteredUsers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast.error("Failed to load team members");
    } finally {
      setLoading(false);
    }
  }, []);

  // Force refresh function that can be called to refresh team members
  const refreshTeamMembers = useCallback(() => {
    console.log("Manually triggering team members refresh");
    setLastRefreshed(Date.now()); // This will trigger useEffect
  }, []);

  useEffect(() => {
    console.log("useEffect triggered in useTeamMembers, fetching data...");
    fetchTeamMembers();
  }, [fetchTeamMembers, lastRefreshed]);

  return { 
    teamMembers, 
    loading, 
    refetchMembers: fetchTeamMembers,
    refreshTeamMembers 
  };
};
