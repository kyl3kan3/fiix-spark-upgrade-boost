
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { ClipboardList, CircleDashed, Loader2, CheckCircle2 } from "lucide-react";
import DashboardQuickActions from "../DashboardQuickActions";
import DashboardRecentActivities from "../DashboardRecentActivities";
import DashboardTasksOverview from "../DashboardTasksOverview";
import { useWorkOrdersData } from "@/hooks/dashboard/useWorkOrdersData";

const OverviewTab: React.FC = () => {
  const navigate = useNavigate();
  const { workOrders, stats, isLoading } = useWorkOrdersData();

  const statCards = [
    { label: "Total Work Orders", value: stats.total, icon: ClipboardList, accent: "text-foreground", iconBg: "bg-muted text-muted-foreground" },
    { label: "Open", value: stats.open, icon: CircleDashed, accent: "text-warning", iconBg: "bg-warning/10 text-warning" },
    { label: "In Progress", value: stats.inProgress, icon: Loader2, accent: "text-info", iconBg: "bg-info/10 text-info" },
    { label: "Completed", value: stats.completed, icon: CheckCircle2, accent: "text-success", iconBg: "bg-success/10 text-success" },
  ];

  return (
    <div className="space-y-6 animate-entry">
      {/* Quick Actions */}
      <div className="animate-entry">
        <DashboardQuickActions />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(({ label, value, icon: Icon, accent, iconBg }) => (
          <Card
            key={label}
            className="surface-card group relative overflow-hidden animate-entry"
          >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <CardContent className="p-5">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1.5">
                  <p className="text-sm font-medium text-muted-foreground">{label}</p>
                  <p className={`text-3xl font-semibold tracking-tight tabular-nums ${accent}`}>
                    {value}
                  </p>
                </div>
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${iconBg}`}>
                  <Icon className="h-5 w-5" />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activities */}
        <div className="animate-entry">
          <DashboardRecentActivities />
        </div>
        
        {/* Tasks Overview */}
        <div className="animate-entry">
          <DashboardTasksOverview />
        </div>
      </div>
      
      {/* Recent Work Orders */}
      <Card className="surface-card animate-entry">
        <CardHeader>
          <CardTitle className="text-lg font-semibold">Recent Work Orders</CardTitle>
          <CardDescription>
            Your most recent maintenance tasks
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {isLoading ? (
              <div className="text-center p-6 text-muted-foreground">
                Loading work orders...
              </div>
            ) : workOrders.length > 0 ? (
              workOrders.slice(0, 5).map((order) => (
                <div 
                  key={order.id} 
                  className="flex items-center justify-between p-4 border border-border/60 rounded-lg hover:bg-accent/40 hover:border-border transition-colors"
                >
                  <div className="min-w-0 pr-3">
                    <p className="font-medium truncate">{order.title}</p>
                    <p className="text-sm text-muted-foreground truncate">{order.description}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border
                      ${order.priority === "high" ? "bg-destructive/10 text-destructive border-destructive/20" : 
                        order.priority === "medium" ? "bg-warning/10 text-warning border-warning/20" : 
                        "bg-success/10 text-success border-success/20"}`}
                    >
                      {order.priority}
                    </span>
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-[11px] font-medium border
                      ${order.status === "pending" ? "bg-info/10 text-info border-info/20" : 
                        order.status === "in_progress" ? "bg-primary/10 text-primary border-primary/20" : 
                        "bg-success/10 text-success border-success/20"}`}
                    >
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center p-6 text-muted-foreground">
                No work orders available
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter>
          <Button 
            variant="outline" 
            onClick={() => navigate("/work-orders")}
            className="w-full"
          >
            View All Work Orders
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default OverviewTab;
