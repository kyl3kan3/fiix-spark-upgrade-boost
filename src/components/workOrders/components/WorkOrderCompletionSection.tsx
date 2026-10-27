import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import type { WorkOrderWithRelations } from "@/types/workOrders";
import { format } from "date-fns";

interface Props {
  workOrder: WorkOrderWithRelations;
}

export function WorkOrderCompletionSection({ workOrder }: Props) {
  const isDone = workOrder.status === "completed";

  const { data: failureCode } = useQuery({
    queryKey: ["maintenance-code", workOrder.failure_code_id],
    enabled: !!workOrder.failure_code_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_codes")
        .select("code, description")
        .eq("id", workOrder.failure_code_id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: downtimeCode } = useQuery({
    queryKey: ["maintenance-code", workOrder.downtime_code_id],
    enabled: !!workOrder.downtime_code_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("maintenance_codes")
        .select("code, description")
        .eq("id", workOrder.downtime_code_id!)
        .maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: partUsage = [] } = useQuery({
    queryKey: ["part-usage", workOrder.id],
    enabled: isDone,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("part_usage_logs")
        .select("quantity, part:parts(name, unit_of_measure)")
        .eq("work_order_id", workOrder.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: lubeUsage = [] } = useQuery({
    queryKey: ["lube-usage", workOrder.id],
    enabled: isDone,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lubricant_usage_logs")
        .select("quantity, lubricant:lubricants(name, unit_of_measure)")
        .eq("work_order_id", workOrder.id);
      if (error) throw error;
      return data ?? [];
    },
  });

  if (!isDone) return null;

  const completedAt = workOrder.updated_at;

  return (
    <Card className="surface-card">
      <CardHeader>
        <CardTitle className="font-headline text-lg">Completion</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 text-sm">
        <div>
          <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Completed</p>
          <p className="font-medium">{format(new Date(completedAt), "MMM d, yyyy h:mm a")}</p>
        </div>
        {(failureCode || downtimeCode || workOrder.downtime_minutes != null) && (
          <div className="grid sm:grid-cols-2 gap-4">
            {failureCode && (
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Failure code</p>
                <p className="font-medium">{failureCode.code}</p>
                {failureCode.description && (
                  <p className="text-muted-foreground">{failureCode.description}</p>
                )}
              </div>
            )}
            {downtimeCode && (
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Downtime code</p>
                <p className="font-medium">{downtimeCode.code}</p>
              </div>
            )}
            {workOrder.downtime_minutes != null && (
              <div>
                <p className="text-muted-foreground text-xs uppercase tracking-wide mb-1">Downtime</p>
                <p className="font-medium">{workOrder.downtime_minutes} minutes</p>
              </div>
            )}
          </div>
        )}
        {partUsage.length > 0 && (
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Parts used</p>
            <ul className="list-disc pl-5 space-y-1">
              {partUsage.map((row, i) => (
                <li key={i}>
                  {(row.part as { name?: string })?.name ?? "Part"} — {row.quantity}{" "}
                  {(row.part as { unit_of_measure?: string })?.unit_of_measure ?? ""}
                </li>
              ))}
            </ul>
          </div>
        )}
        {lubeUsage.length > 0 && (
          <div>
            <p className="text-muted-foreground text-xs uppercase tracking-wide mb-2">Lubricants used</p>
            <ul className="list-disc pl-5 space-y-1">
              {lubeUsage.map((row, i) => (
                <li key={i}>
                  {(row.lubricant as { name?: string })?.name ?? "Lubricant"} — {row.quantity}{" "}
                  {(row.lubricant as { unit_of_measure?: string })?.unit_of_measure ?? ""}
                </li>
              ))}
            </ul>
          </div>
        )}
        {partUsage.length === 0 && lubeUsage.length === 0 && !failureCode && !downtimeCode && (
          <p className="text-muted-foreground">No parts, lubricants, or codes recorded on completion.</p>
        )}
      </CardContent>
    </Card>
  );
}
