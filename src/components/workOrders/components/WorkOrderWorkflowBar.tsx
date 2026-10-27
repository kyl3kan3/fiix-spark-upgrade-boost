import React, { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Play, CheckCheck, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { WorkOrderStatus, WorkOrderWithRelations } from "@/types/workOrders";
import { WorkOrderCompletePartsDialog } from "@/components/parts/WorkOrderCompletePartsDialog";
import { useHasFeature } from "@/hooks/useSubscription";

const STEPS: { key: WorkOrderStatus; label: string }[] = [
  { key: "pending", label: "Pending" },
  { key: "in_progress", label: "In progress" },
  { key: "completed", label: "Completed" },
];

const nextStatus = (s: WorkOrderStatus): WorkOrderStatus | null => {
  if (s === "pending") return "in_progress";
  if (s === "in_progress") return "completed";
  return null;
};

interface Props {
  workOrder: WorkOrderWithRelations;
  onUpdated?: () => void;
}

export function WorkOrderWorkflowBar({ workOrder, onUpdated }: Props) {
  const queryClient = useQueryClient();
  const hasParts = useHasFeature("parts_inventory");
  const hasLubricants = useHasFeature("lubricant_tracking");
  const hasFailureCodes = useHasFeature("failure_downtime_codes");
  const [updating, setUpdating] = useState(false);
  const [completeOpen, setCompleteOpen] = useState(false);

  const next = nextStatus(workOrder.status);
  const stepIndex = STEPS.findIndex((s) => s.key === workOrder.status);

  const applyStatus = async (status: WorkOrderStatus) => {
    setUpdating(true);
    try {
      const { error } = await supabase.from("work_orders").update({ status }).eq("id", workOrder.id);
      if (error) throw error;
      toast.success(status === "in_progress" ? "Work order started" : "Work order completed");
      await queryClient.invalidateQueries({ queryKey: ["workOrder", workOrder.id] });
      await queryClient.invalidateQueries({ queryKey: ["workOrders"] });
      onUpdated?.();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Update failed");
    } finally {
      setUpdating(false);
    }
  };

  const handlePrimary = async () => {
    if (!next) return;
    if (next === "completed" && (hasParts || hasLubricants || hasFailureCodes)) {
      setCompleteOpen(true);
      return;
    }
    await applyStatus(next);
  };

  return (
    <>
      <div className="surface-card rounded-xl border border-border/60 p-4 flex flex-col sm:flex-row sm:items-center gap-4 justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          {STEPS.map((step, i) => (
            <div key={step.key} className="flex items-center gap-2">
              <span
                className={cn(
                  "text-xs font-semibold uppercase tracking-wide px-2.5 py-1 rounded-full border",
                  i <= stepIndex
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-muted text-muted-foreground border-border",
                )}
              >
                {step.label}
              </span>
              {i < STEPS.length - 1 && <span className="text-muted-foreground text-xs">→</span>}
            </div>
          ))}
        </div>
        {next && (
          <Button disabled={updating} onClick={handlePrimary} className="gap-2 shrink-0">
            {updating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : next === "in_progress" ? (
              <Play className="h-4 w-4" />
            ) : (
              <CheckCheck className="h-4 w-4" />
            )}
            {next === "in_progress" ? "Start" : "Complete"}
          </Button>
        )}
      </div>
      <WorkOrderCompletePartsDialog
        open={completeOpen}
        onOpenChange={setCompleteOpen}
        workOrderId={workOrder.id}
        workOrderTitle={workOrder.title}
        assetId={workOrder.asset_id}
        onCompleted={() => applyStatus("completed")}
      />
    </>
  );
}
