import { useCallback, useMemo } from "react";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";
import { conversationKey, getConversationMessages, insertMessage, markConversationAsRead, MESSAGE_PAGE_SIZE } from "@/services/messageService";
import type { Message } from "@/types/chat";

export function useMessages(peerId?: string) {
  const userId = useAuth().user?.id;
  const queryClient = useQueryClient();
  const { data, isLoading, isError, fetchNextPage, hasNextPage, isFetchingNextPage } = useInfiniteQuery({
    queryKey: conversationKey(userId, peerId),
    enabled: Boolean(userId && peerId),
    initialPageParam: null as Pick<Message, "id" | "created_at"> | null,
    queryFn: ({ signal, pageParam }) => getConversationMessages(userId!, peerId!, pageParam, signal),
    getNextPageParam: (page: Message[]) => page.length === MESSAGE_PAGE_SIZE ? page[page.length - 1] : undefined,
  });
  const messages = useMemo(() => data?.pages.flat().reverse() ?? [], [data]);

  const markAsRead = useCallback(async () => {
    if (!userId || !peerId) return;
    try {
      await markConversationAsRead(userId, peerId);
    } catch {
      toast.error("Could not mark messages as read.");
    }
  }, [userId, peerId]);

  async function sendMessage(content: string) {
    if (!userId || !peerId || !content.trim()) return false;
    try {
      await insertMessage(userId, peerId, content.trim());
      void queryClient.invalidateQueries({ queryKey: conversationKey(userId, peerId) });
      return true;
    } catch {
      toast.error("Could not send your message. Your draft is saved here.");
      return false;
    }
  }

  return {
    messages,
    sendMessage,
    markAsRead,
    loading: isLoading,
    loadError: isError,
    loadEarlier: hasNextPage ? () => { void fetchNextPage(); } : undefined,
    loadingEarlier: isFetchingNextPage,
  };
}
