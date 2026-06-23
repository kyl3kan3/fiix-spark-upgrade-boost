import { supabase } from "@/integrations/supabase/client";
import { requireUser } from "@/services/supabaseHelpers";
import { createWorkOrder } from "@/services/workOrderService";
import { createMaintenanceCost } from "@/services/costTrackingService";
import { createEnergyReading } from "@/services/energyService";
import {
  normalizeProposal,
  type AssistantProposal,
  type ChatMessage,
  type WorkOrderProposal,
  type CostProposal,
  type EnergyProposal,
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
    .map((p) => normalizeProposal((p ?? {}) as Record<string, unknown>))
    .filter((p): p is AssistantProposal => p !== null);

  return { reply: data?.reply ?? "", proposals };
};

const confirmWorkOrder = async (p: WorkOrderProposal): Promise<void> => {
  const user = await requireUser();
  const { error } = await createWorkOrder(user.id, {
    title: p.title,
    description: p.description,
    priority: p.priority,
    status: "pending",
    due_date: p.due_date ?? undefined,
    asset_id: p.asset_id ?? null,
    assigned_to: null,
  });
  if (error) throw error;
};

const confirmCost = (p: CostProposal): Promise<void> =>
  createMaintenanceCost({
    asset_id: p.asset_id,
    category: p.category,
    maintenance_type: p.maintenance_type,
    amount: p.amount,
    currency: p.currency,
    description: p.description ?? undefined,
  });

const confirmEnergy = (p: EnergyProposal): Promise<void> =>
  createEnergyReading({
    asset_id: p.asset_id,
    meter_label: p.meter_label,
    kwh: p.kwh,
    cost: p.cost,
    currency: p.currency,
    source: "manual",
  });

/** Execute a confirmed proposal through the relevant RLS-safe create path. */
export const confirmProposal = async (proposal: AssistantProposal): Promise<void> => {
  switch (proposal.type) {
    case "work_order":
      return confirmWorkOrder(proposal);
    case "cost":
      return confirmCost(proposal);
    case "energy":
      return confirmEnergy(proposal);
  }
};

/** react-query keys to refresh after a given proposal type is confirmed. */
export const proposalInvalidationKeys = (type: AssistantProposal["type"]): string[] => {
  switch (type) {
    case "work_order":
      return ["work-orders", "workOrders"];
    case "cost":
      return ["cost-tracking"];
    case "energy":
      return ["power-usage"];
  }
};
