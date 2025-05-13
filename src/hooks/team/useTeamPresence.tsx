
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useTeamPresence = () => {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, boolean>>({});

  useEffect(() => {
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

    return () => {
      supabase.removeChannel(presenceChannel);
    };
  }, []);

  return { onlineUsers };
};
