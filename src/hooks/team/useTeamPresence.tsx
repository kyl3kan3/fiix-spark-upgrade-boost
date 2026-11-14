import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { requireUserCompany } from "@/services/supabaseHelpers";
export const useTeamPresence = () => {
 const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});
 useEffect(() => {
   let cancelled = false;
   let channel: ReturnType<typeof supabase.channel> | null = null;
   void requireUserCompany().then(({ userId, companyId }) => {
     if (cancelled) return;
     channel = supabase.channel(`company:${companyId}:presence`, {
       config: { private: true, presence: { key: userId } },
     });
     const presenceChannel = channel;
     presenceChannel.on("presence", { event: "sync" }, () => {
       if (cancelled) return;
       setOnlineUsers(Object.fromEntries(Object.keys(presenceChannel.presenceState()).map(id => [id, true])));
     }).subscribe(async status => {
       if (status === "SUBSCRIBED" && !cancelled) await presenceChannel.track({ user_id: userId });
     });
   }).catch(() => { if (!cancelled) setOnlineUsers({}); });
   return () => { cancelled = true; if (channel) void supabase.removeChannel(channel); };
 }, []);
 return { onlineUsers };
};
