
import { useState, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { ChatUser } from "@/types/chat";

export const useTeamData = (onlineUsers: Record<string, boolean>) => {
  const [teamMembers, setTeamMembers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTeamMembers = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching team members...", new Date().toISOString());
      
      // Get current user
      const { data: currentUserData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUserData?.user) {
        console.error("Error getting current user or not logged in:", userError);
        toast("Please sign in to view team members");
        setTeamMembers([]);
        setLoading(false);
        return;
      }
      
      const currentUserId = currentUserData.user.id;

      if (!currentUserId) {
        console.error("No current user found");
        toast("Please sign in to view team members");
        setTeamMembers([]);
        setLoading(false);
        return;
      }

      // First, get the current user's company_id
      const { data: currentUserProfile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", currentUserId)
        .single();
        
      if (profileError || !currentUserProfile?.company_id) {
        console.error("Error getting current user's company or user has no company:", profileError);
        setTeamMembers([]);
        setLoading(false);
        return;
      }
      
      const companyId = currentUserProfile.company_id;

      // Fetch all profiles from the same company except current user
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, role, avatar_url, phone_number, company_id")
        .eq("company_id", companyId)
        .neq("id", currentUserId);

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }
      
      console.log(`Fetched ${profiles ? profiles.length : 0} profiles:`, profiles);
      
      if (!profiles || profiles.length === 0) {
        console.log("No team members found in database");
        setTeamMembers([]);
        setLoading(false);
        return;
      }
      
      // Get company information for the profiles
      const { data: company, error: companyError } = await supabase
        .from("companies")
        .select("name")
        .eq("id", companyId)
        .single();
        
      if (companyError) {
        console.error("Error fetching company:", companyError);
      }
      
      const companyName = company ? company.name : '';
      
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
          lastName: profile.last_name || '',
          phone: profile.phone_number || '',
          companyName: companyName
        };
      }));

      const filteredUsers = users.filter(Boolean) as ChatUser[];
      console.log("Processed team members:", filteredUsers);
      setTeamMembers(filteredUsers);
    } catch (error) {
      console.error("Error fetching team members:", error);
      toast("Failed to load team members");
      setTeamMembers([]); // Make sure no members are shown on error
    } finally {
      setLoading(false);
    }
  }, [onlineUsers]);

  return { teamMembers, setTeamMembers, loading, fetchTeamMembers };
};
