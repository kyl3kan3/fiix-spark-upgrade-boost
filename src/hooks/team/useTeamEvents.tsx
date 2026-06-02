
import { useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";

const getUserMessagesChannelTopic = (userId: string, suffix: string) =>
  `user:${userId}:team-messages:${suffix}`;

export const useTeamEvents = (fetchTeamMembers: () => Promise<void>) => {
 useEffect(() => {
 let messageChannel: ReturnType<typeof supabase.channel> | null = null;
 let cancelled = false;
 const instanceId = Math.random().toString(36).slice(2, 10);

 const subscribeToMessageEvents = async () => {
 const { data: userData, error } = await supabase.auth.getUser();
 const currentUserId = userData?.user?.id;

 if (error || !currentUserId) {
 console.error("Error getting current user for message subscription:", error);
 return;
 }

 if (cancelled) return;

 messageChannel = supabase
 .channel(getUserMessagesChannelTopic(currentUserId, instanceId), {
 config: { private: true },
 })
 .on('postgres_changes', 
 { 
 event: '*', 
 schema: 'public', 
 table: 'messages'
 },
 () => {
 fetchTeamMembers();
 })
 .subscribe();
 };

 void subscribeToMessageEvents();

 // Create a channel to listen for profile changes
 const profileChannel = supabase
 .channel(`public:profiles:${instanceId}`)
 .on('postgres_changes', 
 { 
 event: '*', 
 schema: 'public', 
 table: 'profiles'
 },
 () => {
 fetchTeamMembers();
 })
 .subscribe();

 return () => {
 cancelled = true;
 if (messageChannel) {
 supabase.removeChannel(messageChannel);
 }
 supabase.removeChannel(profileChannel);
 };
 }, [fetchTeamMembers]);

 // Force refresh function that can be called to refresh team members
 const refreshTeamMembers = useCallback(() => {
 fetchTeamMembers();
 }, [fetchTeamMembers]);

 return { refreshTeamMembers };
};
