import { supabase } from "@/integrations/supabase/client";
import { requireUser } from "@/services/supabaseHelpers";
import { createWorkOrder } from "@/services/workOrderService";
import {
  normalizeWorkOrderProposal,
  type AssistantProposal,
  type ChatMessage,
  type WorkOrderProposal,
} from "@/lib/assistant";

export interface AssistantReply {
  reply: string;
  proposals: AssistantProposal[];
}

interface RawResponse {
  reply?: string;
  proposals?: unknown[];
  error?: string;
}

/** Send the conversation to the assistant edge function and get a reply + any proposals. */
export const sendAssistantMessage = async (messages: ChatMessage[]): Promise<AssistantReply> => {
  const { data, error } = await supabase.functions.invoke<RawResponse>("maintenance-assistant", {
    body: { messages: messages.map((m) => ({ role: m.role, content: m.content })) },
  });
  if (error) throw error;
  if (data?.error) throw new Error(data.error);

  const proposals = (data?.proposals ?? [])
    .map((p) => normalizeWorkOrderProposal((p ?? {}) as Record<string, unknown>))
    .filter((p): p is WorkOrderProposal => p !== null);

  return { reply: data?.reply ?? "", proposals };
};

/** Execute a confirmed work-order proposal through the normal RLS-safe create path. */
export const confirmWorkOrderProposal = async (proposal: WorkOrderProposal): Promise<void> => {
  const user = await requireUser();
  const { error } = await createWorkOrder(user.id, {
    title: proposal.title,
    description: proposal.description,
    priority: proposal.priority,
    status: "pending",
    due_date: proposal.due_date ?? undefined,
    asset_id: proposal.asset_id ?? null,
    assigned_to: null,
  });
  if (error) throw error;
};
