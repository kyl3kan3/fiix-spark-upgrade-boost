
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface PendingInvitation {
  id: string;
  email: string;
  role: string;
  created_at: string;
  invited_by: string;
}

export const usePendingInvitations = () => {
  const [pendingInvitations, setPendingInvitations] = useState<PendingInvitation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPendingInvitations = useCallback(async () => {
    try {
      setLoading(true);
      console.log("Fetching pending invitations...");
      
      // Get current user
      const { data: currentUserData, error: userError } = await supabase.auth.getUser();
      
      if (userError || !currentUserData?.user) {
        console.error("Error getting current user:", userError);
        setPendingInvitations([]);
        setLoading(false);
        return;
      }
      
      const currentUserId = currentUserData.user.id;

      // Get the current user's company_id
      const { data: currentUserProfile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", currentUserId)
        .single();
        
      if (profileError || !currentUserProfile?.company_id) {
        console.error("Error getting current user's company:", profileError);
        setPendingInvitations([]);
        setLoading(false);
        return;
      }
      
      const companyId = currentUserProfile.company_id;

      // Fetch pending invitations for this organization
      const { data: invitations, error } = await supabase
        .from("organization_invitations")
        .select("id, email, role, created_at, invited_by")
        .eq("organization_id", companyId)
        .eq("status", "pending");

      if (error) {
        console.error("Error fetching pending invitations:", error);
        throw error;
      }
      
      console.log(`Fetched ${invitations ? invitations.length : 0} pending invitations:`, invitations);
      setPendingInvitations(invitations || []);
    } catch (error) {
      console.error("Error fetching pending invitations:", error);
      toast("Failed to load pending invitations");
      setPendingInvitations([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPendingInvitations();
  }, [fetchPendingInvitations]);

  return { pendingInvitations, loading, refreshPendingInvitations: fetchPendingInvitations };
};
