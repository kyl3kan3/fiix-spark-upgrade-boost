
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatUser } from "@/types/chat";
import { toast } from "sonner";

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      
      // Get current user
      const { data: currentUserData } = await supabase.auth.getUser();
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

      if (error) throw error;
      
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

        return {
          id: profile.id,
          name: `${profile.first_name || ''} ${profile.last_name || ''}`.trim() || profile.email,
          email: profile.email,
          role: profile.role || "viewer",
          avatar: profile.avatar_url ? profile.avatar_url.substring(0, 2).toUpperCase() : null,
          online: false,  // We'll set this to false for now
          unread: count || 0
        };
      }));

      setTeamMembers(users.filter(Boolean) as ChatUser[]);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast({
        title: "Error",
        description: "Failed to load team members",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTeamMembers();
  }, [fetchTeamMembers]);

  return { teamMembers, loading, refetchMembers: fetchTeamMembers };
};
