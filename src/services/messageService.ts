import { supabase } from "@/integrations/supabase/client";
import { Message } from "@/types/chat";

export const MESSAGE_PAGE_SIZE = 100;
type MessageCursor = Pick<Message, "id" | "created_at">;

/** Fetch newest messages first, so long-running conversations also receive new replies. */
export async function getConversationMessages(
  currentUserId: string,
  recipientId: string,
  before: MessageCursor | null,
  signal?: AbortSignal
): Promise<Message[]> {
  const query = supabase
    .from("messages")
    .select("*")
    .or(`and(sender_id.eq.${currentUserId},recipient_id.eq.${recipientId}),and(sender_id.eq.${recipientId},recipient_id.eq.${currentUserId})`)
    .order("created_at", { ascending: false })
    .order("id", { ascending: false })
    .limit(MESSAGE_PAGE_SIZE);
  if (before) query.or(`created_at.lt.${before.created_at},and(created_at.eq.${before.created_at},id.lt.${before.id})`);
  const { data, error } = await (signal ? query.abortSignal(signal) : query);
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

export const conversationKey = (userId?: string, peerId?: string) =>
  peerId ? ["messages", userId, peerId] : ["messages", userId];

/** Refresh through RLS on join/reconnect as well as on each database notification. */
export function subscribeToMessageUpdates(userId: string, refresh: (peerId?: string) => void) {
  const channel = supabase.channel(`user:${userId}:messages`, { config: { private: true } })
    .on("broadcast", { event: "changed" }, ({ payload }) => {
      if (typeof payload?.peer_id === "string") refresh(payload.peer_id);
    })
    .subscribe(status => {
      if (status === "SUBSCRIBED") refresh();
    });
  return () => { void supabase.removeChannel(channel); };
}
