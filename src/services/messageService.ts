import type { RealtimeChannel, RealtimePostgresChangesPayload } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";

const getUserMessagesChannelTopic = (userId: string, recipientId: string) =>
  `user:${userId}:messages:${recipientId}`;

/** Fetch every message exchanged between the two users, oldest first. */
export async function getConversationMessages(
  currentUserId: string,
  recipientId: string
): Promise<Message[]> {
  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
    .order("created_at", { ascending: true });

  if (error) throw error;
  return data || [];
}

/** Insert a new (unread) message from the sender to the recipient. */
export async function insertMessage(
  senderId: string,
  recipientId: string,
  content: string
): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .insert({
      sender_id: senderId,
      recipient_id: recipientId,
      content,
      read: false
    });

  if (error) throw error;
}

/** Mark all unread messages sent by `senderId` to `currentUserId` as read. */
export async function markConversationAsRead(
  currentUserId: string,
  senderId: string
): Promise<void> {
  const { error } = await supabase
    .from("messages")
    .update({ read: true })
    .eq("sender_id", senderId)
    .eq("recipient_id", currentUserId)
    .eq("read", false);

  if (error) throw error;
}

export type MessageChangePayload = RealtimePostgresChangesPayload<Message>;

/**
 * Open a realtime channel for the conversation between the two users and
 * invoke `onChange` for every INSERT/UPDATE/DELETE on the messages table that
 * involves the recipient. Returns the channel; callers own its lifecycle and
 * must pass it to `removeMessagesChannel` on cleanup.
 */
export function subscribeToConversationMessages(
  currentUserId: string,
  recipientId: string,
  onChange: (payload: MessageChangePayload) => void
): RealtimeChannel {
  return supabase
    .channel(getUserMessagesChannelTopic(currentUserId, recipientId), {
      config: { private: true },
    })
    .on('postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages',
        filter: `or(recipient_id.eq.${recipientId},sender_id.eq.${recipientId})`
      },
      onChange
    )
    .subscribe();
}

/** Tear down a channel created by `subscribeToConversationMessages`. */
export function removeMessagesChannel(channel: RealtimeChannel): void {
  supabase.removeChannel(channel);
}
