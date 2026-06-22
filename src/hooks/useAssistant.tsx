import { useCallback, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  sendAssistantMessage,
  confirmWorkOrderProposal,
} from "@/services/assistantService";
import type { ChatMessage, WorkOrderProposal } from "@/lib/assistant";

export type ProposalStatus = "pending" | "confirming" | "done" | "error";

export interface ProposalState {
  proposal: WorkOrderProposal;
  status: ProposalStatus;
}

export interface AssistantUiMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  proposals?: ProposalState[];
  isError?: boolean;
}

const uid = () =>
  typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random()}`;

export function useAssistant() {
  const queryClient = useQueryClient();
  const [messages, setMessages] = useState<AssistantUiMessage[]>([]);
  const [isSending, setIsSending] = useState(false);

  const send = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || isSending) return;

      const userMsg: AssistantUiMessage = { id: uid(), role: "user", content: trimmed };
      const history: ChatMessage[] = [...messages, userMsg].map((m) => ({
        id: m.id,
        role: m.role,
        content: m.content,
      }));
      setMessages((prev) => [...prev, userMsg]);
      setIsSending(true);
      try {
        const { reply, proposals } = await sendAssistantMessage(history);
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content: reply || "…",
            proposals: proposals.map((p) => ({ proposal: p, status: "pending" as ProposalStatus })),
          },
        ]);
      } catch (e) {
        console.error("Assistant error:", e);
        setMessages((prev) => [
          ...prev,
          {
            id: uid(),
            role: "assistant",
            content:
              e instanceof Error && e.message
                ? e.message
                : "Sorry — I couldn't reach the assistant just now.",
            isError: true,
          },
        ]);
      } finally {
        setIsSending(false);
      }
    },
    [messages, isSending],
  );

  const setProposalStatus = (messageId: string, index: number, status: ProposalStatus) =>
    setMessages((prev) =>
      prev.map((m) =>
        m.id === messageId && m.proposals
          ? { ...m, proposals: m.proposals.map((p, i) => (i === index ? { ...p, status } : p)) }
          : m,
      ),
    );

  const confirmProposal = useCallback(async (messageId: string, index: number, proposal: WorkOrderProposal) => {
    setProposalStatus(messageId, index, "confirming");
    try {
      await confirmWorkOrderProposal(proposal);
      setProposalStatus(messageId, index, "done");
      toast.success("Work order created");
      queryClient.invalidateQueries({ queryKey: ["work-orders"] });
      queryClient.invalidateQueries({ queryKey: ["workOrders"] });
    } catch (e) {
      console.error("Failed to create work order:", e);
      setProposalStatus(messageId, index, "error");
      toast.error("Couldn't create the work order");
    }
  }, [queryClient]);

  return { messages, send, isSending, confirmProposal };
}
