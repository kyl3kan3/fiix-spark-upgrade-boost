import { useCallback, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth";
import { conversationKey, subscribeToMessageUpdates } from "@/services/messageService";
import { subscribeToTeamProfileChanges } from "@/services/team/teamMemberService";

export function useTeamEvents(fetchTeamMembers: () => Promise<void>) {
  const userId = useAuth().user?.id;
  const queryClient = useQueryClient();
  const fetchRef = useRef(fetchTeamMembers);
  useEffect(() => { fetchRef.current = fetchTeamMembers; }, [fetchTeamMembers]);

  useEffect(() => {
    if (!userId) return;
    const unsubscribe = subscribeToMessageUpdates(userId, async peerId => {
      const queryKey = conversationKey(userId, peerId);
      // A change can arrive while the first history request is still in flight.
      await queryClient.cancelQueries({ queryKey });
      void queryClient.invalidateQueries({ queryKey });
      void fetchRef.current();
    });
    const unsubscribeProfiles = subscribeToTeamProfileChanges(userId, () => { void fetchRef.current(); });
    return () => {
      unsubscribe();
      unsubscribeProfiles();
    };
  }, [queryClient, userId]);

  const refreshTeamMembers = useCallback(() => { void fetchRef.current(); }, []);
  return { refreshTeamMembers };
}
