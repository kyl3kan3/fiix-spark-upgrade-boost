import React from "react";
import { Link } from "react-router-dom";
import { formatDistanceToNow } from "date-fns";
import { ArrowRight, Wrench } from "lucide-react";
import { WorkOrderWithRelations } from "@/types/workOrders";
import { getStatusColor, getPriorityColor } from "@/components/workOrders/workOrderUtils";

/**
 * Recent work orders list for the dashboard. The dashboard already fetches
 * the 10 most recent work orders for its KPI counts; this surfaces them so
 * the page shows real activity instead of numbers alone.
 */
export function RecentWorkOrders({
  workOrders,
}: {
  workOrders: WorkOrderWithRelations[];
}) {
  const recent = workOrders.slice(0, 5);
  if (recent.length === 0) return null;

  return (
    <section className="mt-8">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="font-headline text-xl text-foreground">Recent work orders</h3>
        <Link
          to="/work-orders"
          className="inline-flex items-center gap-1 text-sm font-medium text-primary hover:underline"
        >
          View all
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
      <div className="surface-card divide-y divide-border/70 overflow-hidden">
        {recent.map((workOrder) => (
          <Link
            key={workOrder.id}
            to={`/work-orders/${workOrder.id}`}
            className="flex items-center gap-4 p-4 transition-colors hover:bg-muted/40"
          >
            <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/5 text-primary">
              <Wrench className="h-4 w-4" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block truncate font-medium text-foreground">
                {workOrder.title}
              </span>
              <span className="block truncate text-xs text-muted-foreground">
                {workOrder.asset?.name ? `${workOrder.asset.name} · ` : ""}
                {formatDistanceToNow(new Date(workOrder.created_at), { addSuffix: true })}
              </span>
            </span>
            <span className="hidden sm:flex items-center gap-2 shrink-0">
              {workOrder.priority && (
                <span
                  className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getPriorityColor(workOrder.priority)}`}
                >
                  {workOrder.priority}
                </span>
              )}
              <span
                className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${getStatusColor(workOrder.status ?? "")}`}
              >
                {(workOrder.status ?? "unknown").replace("_", " ")}
              </span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
