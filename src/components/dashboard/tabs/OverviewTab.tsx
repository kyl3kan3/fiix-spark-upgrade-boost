import React from "react";
import { useNavigate } from "react-router-dom";
import { ChevronRight, AlertCircle, Clock, CheckCircle2, ListTodo } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import DashboardQuickActions from "../DashboardQuickActions";
import DashboardRecentActivities from "../DashboardRecentActivities";
import DashboardTasksOverview from "../DashboardTasksOverview";
import { useWorkOrdersData } from "@/hooks/dashboard/useWorkOrdersData";
import { cn } from "@/lib/utils";

interface SummaryProps {
  icon: React.ElementType;
  value: number | string;
  label: string;
  tone?: "neutral" | "warning" | "info" | "success";
}

const Summary: React.FC<SummaryProps> = ({ icon: Icon, value, label, tone = "neutral" }) => {
  const toneBg = {
    neutral: "bg-secondary text-foreground",
    warning: "bg-warning/15 text-warning",
    info: "bg-info/15 text-info",
    success: "bg-success/15 text-success",
  }[tone];
  return (
    <div className="rounded-3xl border-2 border-border bg-card p-5 hover:border-primary/40 transition-colors">
      <div className={cn("h-12 w-12 rounded-2xl flex items-center justify-center mb-3", toneBg)}>
        <Icon className="h-6 w-6" strokeWidth={2.2} />
      </div>
      <div className="font-display font-extrabold text-3xl leading-none tabular-nums">{value}</div>
      <div className="mt-1 text-sm font-semibold text-muted-foreground">{label}</div>
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
      {/* Summary cards */}
      <section>
        <h2 className="font-display font-bold text-lg mb-3">How things are going</h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <Summary icon={ListTodo} value={stats.total} label="All jobs" />
          <Summary icon={AlertCircle} value={stats.open} label="Need attention" tone="warning" />
          <Summary icon={Clock} value={stats.inProgress} label="Being worked on" tone="info" />
          <Summary icon={CheckCircle2} value={stats.completed} label="Finished" tone="success" />
        </div>
      </section>

      {/* Quick actions */}
      <section>
        <h2 className="font-display font-bold text-lg mb-3">What do you want to do?</h2>
        <DashboardQuickActions />
      </section>

      {/* Activities + Tasks */}
      <section>
        <h2 className="font-display font-bold text-lg mb-3">What's happening</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
          <DashboardRecentActivities />
          <DashboardTasksOverview />
        </div>
      </section>

      {/* Recent work orders — drafting log */}
      <section>
        <h2 className="font-display font-bold text-lg mb-3">Recent jobs</h2>

        <div className="rounded-3xl border-2 border-border bg-card overflow-hidden">

          {isLoading ? (
            <div className="p-8 text-center text-sm font-semibold text-muted-foreground">
              Loading…
            </div>
          ) : workOrders.length > 0 ? (
            workOrders.slice(0, 6).map((order) => (
              <button
                key={order.id}
                onClick={() => navigate(`/work-orders/${order.id}`)}
                className="w-full flex items-center gap-3 px-4 py-4 border-b border-border last:border-b-0 hover:bg-secondary/60 transition-colors text-left group"
              >
                <div className="min-w-0 flex-1">
                  <div className="font-bold text-base truncate">{order.title}</div>
                  <div className="text-sm text-muted-foreground truncate">{order.description}</div>
                </div>
                <div className="hidden sm:flex items-center gap-2 shrink-0">
                  <Badge variant={priorityVariant(order.priority) as any}>{order.priority}</Badge>
                  <Badge variant={statusVariant(order.status) as any}>
                    {order.status?.replace("_", " ")}
                  </Badge>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground/50 group-hover:text-primary transition-colors shrink-0" />
              </button>
            ))
          ) : (
            <div className="p-12 text-center">
              <div className="text-base font-semibold text-muted-foreground">
                No jobs yet — you're all caught up! 🎉
              </div>
            </div>
          )}

          <div className="p-3 border-t-2 border-border bg-secondary/30">
            <Button variant="outline" onClick={() => navigate("/work-orders")} className="w-full" size="lg">
              See all my jobs
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
};

export default OverviewTab;
