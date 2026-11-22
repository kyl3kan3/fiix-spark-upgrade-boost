import { act, renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { PropsWithChildren } from "react";
import { expect, it, vi } from "vitest";
import { useTeamEvents } from "./useTeamEvents";
import { useMessages } from "@/hooks/useMessages";
import { getConversationMessages, insertMessage, subscribeToMessageUpdates } from "@/services/messageService";

vi.mock("@/hooks/auth", () => ({ useAuth: () => ({ user: { id: "caller" } }) }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    channel: () => ({ on: () => ({ subscribe: () => ({}) }) }),
    removeChannel: vi.fn(),
  },
}));
vi.mock("@/services/messageService", async importActual => ({
  ...(await importActual<typeof import("@/services/messageService")>()),
  getConversationMessages: vi.fn(),
  insertMessage: vi.fn(),
  subscribeToMessageUpdates: vi.fn(),
}));

it("refreshes the selected conversation on delivery and reconnect and keeps peers separate", async () => {
  const cleanup = vi.fn();
  vi.mocked(subscribeToMessageUpdates).mockReturnValue(cleanup);
  const fromPeer = (id: string) => ({
    id, sender_id: "peer", recipient_id: "caller", content: id, read: false, created_at: "2026-11-22T12:00:00Z",
  });
  const initial = fromPeer("first");
  vi.mocked(getConversationMessages).mockResolvedValue([initial]);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: PropsWithChildren) =>
    <QueryClientProvider client={client}>{children}</QueryClientProvider>;
  const teamRefresh = vi.fn().mockResolvedValue(undefined);
  const { result, unmount } = renderHook(() => {
    useTeamEvents(teamRefresh);
    return useMessages("peer");
  }, { wrapper });
  await waitFor(() => expect(result.current.messages).toEqual([initial]));
  const refresh = vi.mocked(subscribeToMessageUpdates).mock.calls[0][1];
  await act(() => refresh("other-peer"));
  expect(getConversationMessages).toHaveBeenCalledTimes(1);

  const later = fromPeer("later");
  vi.mocked(getConversationMessages).mockResolvedValue([later, initial]);
  await act(() => refresh("peer"));
  await waitFor(() => expect(result.current.messages).toEqual([initial, later]));
  await act(() => refresh());
  await waitFor(() => expect(getConversationMessages).toHaveBeenCalledTimes(3));
  expect(result.current.messages).toEqual([initial, later]);

  vi.mocked(insertMessage).mockRejectedValueOnce(new Error("Offline"));
  await expect(result.current.sendMessage("keep this draft")).resolves.toBe(false);
  unmount();
  expect(cleanup).toHaveBeenCalledOnce();
  client.clear();
});
