
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ChatUser } from "@/types/chat";
import { toast } from "sonner";

export const useTeamMembers = () => {
  const [teamMembers, setTeamMembers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [lastRefreshed, setLastRefreshed] = useState(Date.now());
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

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
          avatar: profile.avatar_url ? profile.avatar_url : (profile.first_name && profile.last_name ? `${profile.first_name[0]}${profile.last_name[0]}`.toUpperCase() : displayName.substring(0, 2).toUpperCase()),
          online: onlineUsers[profile.id] || false,
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
  }, [onlineUsers]);

  // Force refresh function that can be called to refresh team members
  const refreshTeamMembers = useCallback(() => {
    console.log("Manually triggering team members refresh");
    setLastRefreshed(Date.now()); // This will trigger useEffect
  }, []);

  // Update a user's information
  const updateTeamMember = useCallback(async (userId: string, updates: {
    firstName?: string;
    lastName?: string;
    role?: string;
    email?: string;
  }) => {
    try {
      console.log("Updating team member:", userId, updates);
      
      const updateData: Record<string, any> = {};
      if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
      if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
      if (updates.role !== undefined) updateData.role = updates.role;
      if (updates.email !== undefined) updateData.email = updates.email;
      
      const { error } = await supabase
        .from("profiles")
        .update(updateData)
        .eq("id", userId);
        
      if (error) {
        console.error("Error updating team member:", error);
        throw error;
      }
      
      // Update local state with the new information
      setTeamMembers(prev => 
        prev.map(member => 
          member.id === userId 
            ? { 
                ...member, 
                ...(updates.firstName !== undefined && { firstName: updates.firstName }),
                ...(updates.lastName !== undefined && { lastName: updates.lastName }),
                ...(updates.role !== undefined && { role: updates.role }),
                ...(updates.email !== undefined && { email: updates.email }),
                ...(updates.firstName !== undefined || updates.lastName !== undefined ? { 
                  name: `${updates.firstName || member.firstName} ${updates.lastName || member.lastName}`.trim() || member.email,
                  avatar: (updates.firstName || member.firstName) && (updates.lastName || member.lastName) ? 
                    `${(updates.firstName || member.firstName)[0]}${(updates.lastName || member.lastName)[0]}`.toUpperCase() : 
                    (updates.firstName || member.firstName || updates.email || member.email).substring(0, 2).toUpperCase()
                } : {})
              } 
            : member
        )
      );
      
      return { success: true };
    } catch (error) {
      console.error("Error updating team member:", error);
      toast.error("Failed to update team member");
      return { success: false, error };
    }
  }, []);

  useEffect(() => {
    console.log("useEffect triggered in useTeamMembers, fetching data...");
    fetchTeamMembers();

    // Create a channel for real-time presence
    const presenceChannel = supabase
      .channel('online-users')
      .on('presence', { event: 'sync' }, () => {
        const state = presenceChannel.presenceState();
        console.log('Presence state updated:', state);
        
        const onlineStatus: Record<string, boolean> = {};
        Object.keys(state).forEach(userId => {
          onlineStatus[userId] = true;
        });
        
        setOnlineUsers(onlineStatus);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          // Get current user
          const { data } = await supabase.auth.getUser();
          if (data?.user) {
            // Track current user as online
            await presenceChannel.track({ 
              user_id: data.user.id, 
              online_at: new Date().toISOString() 
            });
          }
        }
      });

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
      supabase.removeChannel(presenceChannel);
    };
  }, [fetchTeamMembers, lastRefreshed]);

  return { 
    teamMembers, 
    loading, 
    refreshTeamMembers,
    updateTeamMember
  };
};
