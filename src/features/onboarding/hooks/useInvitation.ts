
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
 const { data: invites, error } = await supabase
 .rpc("get_invitation_by_token", { _token: token });
 const invite = invites?.[0];
 if (!error && invite && invite.status === "pending") {
 setIsInvited(true);
 setInviteDetails(invite as any);
 return;
 }
 }

 setIsInvited(false);
 setInviteDetails(null);
 };
 
 checkInvitation();
 }, [email]);

 return { isInvited, inviteDetails };
};
