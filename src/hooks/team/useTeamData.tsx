
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
      
      if (userError) {
        console.error("Error getting current user:", userError);
        throw userError;
      }
      
      const currentUserId = currentUserData?.user?.id;

      if (!currentUserId) {
        console.error("No current user found");
        toast.error("Please sign in to view team members");
        setLoading(false);
        return;
      }

      // Fetch all profiles except current user
      // Using a more specific select statement to avoid issues with missing columns
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("id, email, first_name, last_name, role, avatar_url, phone_number")
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
      
      // Try to fetch company names separately to handle the case if column doesn't exist
      let companyNames: Record<string, string> = {};
      try {
        const { data: companyData, error: companyError } = await supabase
          .from("profiles")
          .select("id, company_name")
          .neq("id", currentUserId);
          
        if (!companyError && companyData) {
          companyNames = companyData.reduce((acc: Record<string, string>, profile: any) => {
            if (profile.company_name) {
              acc[profile.id] = profile.company_name;
            }
            return acc;
          }, {});
        } else {
          console.log("Company name data not available:", companyError);
        }
      } catch (err) {
        console.log("Error fetching company names, will continue without them:", err);
      }
      
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

        // Cast the profile to include profile data
        const profileWithData = profile as any;

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
          phone: profileWithData.phone_number || '',
          companyName: companyNames[profile.id] || ''
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

  return { teamMembers, setTeamMembers, loading, fetchTeamMembers };
};
