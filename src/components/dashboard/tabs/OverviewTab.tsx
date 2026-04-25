import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowUpRight, ArrowDownRight, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardQuickActions from "../DashboardQuickActions";
import DashboardRecentActivities from "../DashboardRecentActivities";
import DashboardTasksOverview from "../DashboardTasksOverview";
import { useWorkOrdersData } from "@/hooks/dashboard/useWorkOrdersData";
import { cn } from "@/lib/utils";

interface KpiProps {
  code: string;
  label: string;
  value: number | string;
  delta?: number;
  tone?: "neutral" | "warning" | "info" | "success" | "destructive";
}

const Kpi: React.FC<KpiProps> = ({ code, label, value, delta, tone = "neutral" }) => {
  const toneClass = {
    neutral: "text-foreground",
    warning: "text-warning",
    info: "text-info",
    success: "text-success",
    destructive: "text-destructive",
  }[tone];

  return (
    <div className="ticket-card p-5 hover-scale">
      <div className="flex items-center justify-between mb-4">
        <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-accent">{code}</span>
        {delta !== undefined && (
          <span
            className={cn(
              "inline-flex items-center gap-0.5 font-mono text-[10px] tracking-wider uppercase",
              delta >= 0 ? "text-success" : "text-destructive"
            )}
          >
            {delta >= 0 ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
            {Math.abs(delta)}%
          </span>
        )}
      </div>
      <div className={cn("font-display font-bold text-4xl leading-none tabular-nums", toneClass)}>
        {value}
      </div>
      <div className="mt-2 label-meta">{label}</div>
    </div>
  );
};

const OverviewTab: React.FC = () => {
  const navigate = useNavigate();
  const { workOrders, stats, isLoading } = useWorkOrdersData();

  const priorityVariant = (p?: string) =>
    p === "high" ? "destructive" : p === "medium" ? "warning" : "success";
  const statusVariant = (s?: string) =>
    s === "completed" ? "success" : s === "in_progress" ? "info" : "warning";

  return (
    <div className="space-y-8">
      {/* KPI strip */}
      <section>
        <div className="label-eyebrow mb-3 flex items-center gap-2">
          <span className="text-accent">▮</span>
          <span>SECTION 01 — KEY METRICS</span>
          <span className="divider-ticked flex-1 max-w-[120px]" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Kpi code="WO·TOT" label="Total Work Orders" value={stats.total} delta={4} />
          <Kpi code="WO·OPN" label="Open" value={stats.open} tone="warning" delta={-2} />
          <Kpi code="WO·PRG" label="In Progress" value={stats.inProgress} tone="info" delta={8} />
          <Kpi code="WO·CMP" label="Completed" value={stats.completed} tone="success" delta={12} />
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <div className="label-eyebrow mb-3 flex items-center gap-2">
          <span className="text-accent">▮</span>
          <span>SECTION 02 — DISPATCH</span>
          <span className="divider-ticked flex-1 max-w-[120px]" />
        </div>
        <DashboardQuickActions />
      </section>

      {/* Activities + Tasks */}
      <section>
        <div className="label-eyebrow mb-3 flex items-center gap-2">
          <span className="text-accent">▮</span>
          <span>SECTION 03 — LIVE FEED</span>
          <span className="divider-ticked flex-1 max-w-[120px]" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <DashboardRecentActivities />
          <DashboardTasksOverview />
        </div>
      </section>

      {/* Recent work orders — drafting log */}
      <section>
        <div className="label-eyebrow mb-3 flex items-center gap-2">
          <span className="text-accent">▮</span>
          <span>SECTION 04 — RECENT WORK ORDERS</span>
          <span className="divider-ticked flex-1 max-w-[120px]" />
        </div>

        <div className="ticket-card overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[80px,1fr,90px,90px,32px] items-center gap-3 px-4 py-2.5 border-b border-border bg-muted/40 label-meta">
            <span>ID</span>
            <span>Title</span>
            <span>Priority</span>
            <span>Status</span>
            <span></span>
          </div>

          {isLoading ? (
            <div className="p-8 text-center font-mono text-xs uppercase tracking-wider text-muted-foreground">
              Loading…
            </div>
          ) : workOrders.length > 0 ? (
            workOrders.slice(0, 6).map((order, idx) => (
              <button
                key={order.id}
                onClick={() => navigate(`/work-orders/${order.id}`)}
                className="w-full grid grid-cols-[80px,1fr,90px,90px,32px] items-center gap-3 px-4 py-3 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors text-left group"
              >
                <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
                  WO-{String(idx + 1).padStart(4, "0")}
                </span>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{order.title}</div>
                  <div className="text-xs text-muted-foreground truncate">{order.description}</div>
                </div>
                <Badge variant={priorityVariant(order.priority) as any}>{order.priority}</Badge>
                <Badge variant={statusVariant(order.status) as any}>
                  {order.status?.replace("_", " ")}
                </Badge>
                <ChevronRight className="h-4 w-4 text-muted-foreground/40 group-hover:text-accent transition-colors" />
              </button>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                No work orders on file
              </div>
            </div>
          )}

          <div className="p-3 border-t border-border bg-muted/20">
            <Button variant="outline" onClick={() => navigate("/work-orders")} className="w-full" size="sm">
              View all work orders
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewTab;
