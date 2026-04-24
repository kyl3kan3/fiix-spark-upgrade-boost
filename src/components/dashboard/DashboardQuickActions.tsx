
import React from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FileText,
  CalendarDays,
  Wrench,
  CheckSquare,
  FileBarChart,
  ArrowUpRight,
} from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardQuickActions = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleActionClick = (action: string, path: string) => {
    if (path) {
      navigate(path);
      toast.info(`Navigating to ${action}`);
    }
  };

  const allActions = [
    {
      title: "New Work Order",
      icon: FileText,
      tone: "bg-info/10 text-info ring-1 ring-info/20",
      onClick: () => handleActionClick("New Work Order", "/work-orders/new"),
    },
    {
      title: "Schedule",
      icon: CalendarDays,
      tone: "bg-success/10 text-success ring-1 ring-success/20",
      onClick: () => handleActionClick("Schedule Maintenance", "/calendar"),
    },
    {
      title: "Assets",
      icon: Wrench,
      tone: "bg-primary/10 text-primary ring-1 ring-primary/20",
      onClick: () => handleActionClick("Asset Management", "/assets"),
    },
    {
      title: "Inspections",
      icon: CheckSquare,
      tone: "bg-accent text-accent-foreground ring-1 ring-primary/20",
      onClick: () => handleActionClick("Inspections", "/inspections"),
    },
    {
      title: "Reports",
      icon: FileBarChart,
      tone: "bg-warning/10 text-warning ring-1 ring-warning/20",
      onClick: () => handleActionClick("Reports", "/reports"),
    },
  ];

  const quickActions = isMobile ? allActions.slice(0, 3) : allActions;

  return (
    <Card className="surface-card animate-entry overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base font-semibold tracking-tight">Quick Actions</CardTitle>
          <span className="text-xs text-muted-foreground">Jump in fast</span>
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {quickActions.map(({ title, icon: Icon, tone, onClick }) => (
            <button
              key={title}
              onClick={onClick}
              className="group relative flex flex-col items-start gap-3 p-4 rounded-xl bg-card border border-border/60 hover:border-primary/40 hover:shadow-md transition-all text-left focus:outline-none focus:ring-2 focus:ring-primary/40"
            >
              <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${tone}`}>
                <Icon className="h-5 w-5" />
              </div>
              <span className="text-sm font-medium text-foreground leading-tight">{title}</span>
              <ArrowUpRight className="absolute top-3 right-3 h-4 w-4 text-muted-foreground/40 group-hover:text-primary group-hover:-translate-y-0.5 group-hover:translate-x-0.5 transition-all" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default DashboardQuickActions;
