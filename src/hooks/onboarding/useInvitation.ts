
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { InviteDetails } from "./types";

export const useInvitation = (email: string) => {
  const [isInvited, setIsInvited] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);

  // Check if the user was invited to a company
  useEffect(() => {
    const checkInvitation = async () => {
      // Prefer the explicit token captured at the invite link, fall back to email match
      const token = localStorage.getItem("pending_invite_token");

      if (token) {
        const { data: invite, error } = await supabase
          .from("organization_invitations")
          .select("*")
          .eq("token", token)
          .eq("status", "pending")
          .maybeSingle();

        if (!error && invite) {
          setIsInvited(true);
          setInviteDetails(invite);
          return;
        }
      }

      if (!email) return;

      const { data: invites, error } = await supabase
        .from("organization_invitations")
        .select("*")
        .eq("email", email)
        .eq("status", "pending");

      if (error) {
        console.error("Error checking invitations:", error);
        return;
      }

      if (invites && invites.length > 0) {
        setIsInvited(true);
        setInviteDetails(invites[0]);
      }
    };
    
    checkInvitation();
  }, [email]);

  return { isInvited, inviteDetails };
};
