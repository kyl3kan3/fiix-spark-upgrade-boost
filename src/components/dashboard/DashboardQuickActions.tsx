import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, CalendarDays, Wrench, CheckSquare, FileBarChart, ArrowUpRight } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardQuickActions: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const actions = [
    { code: "WO+",  title: "Work Order", icon: FileText,    href: "/work-orders/new" },
    { code: "CAL",  title: "Schedule",   icon: CalendarDays, href: "/calendar" },
    { code: "AST",  title: "Assets",     icon: Wrench,      href: "/assets" },
    { code: "INS",  title: "Inspections",icon: CheckSquare, href: "/inspections" },
    { code: "RPT",  title: "Reports",    icon: FileBarChart,href: "/reports" },
  ];
  const visible = isMobile ? actions.slice(0, 3) : actions;

  return (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
      {visible.map(({ code, title, icon: Icon, href }) => (
        <button
          key={code}
          onClick={() => navigate(href)}
          className="ticket-card group text-left p-4 hover:border-foreground/40 transition-colors relative"
        >
          <div className="flex items-center justify-between mb-6">
            <span className="font-mono text-[10px] tracking-[0.18em] uppercase text-accent">{code}</span>
            <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground/40 group-hover:text-accent transition-colors" strokeWidth={1.5} />
          </div>
          <Icon className="h-5 w-5 mb-3 text-foreground" strokeWidth={1.5} />
          <span className="block font-display text-sm font-semibold leading-tight">{title}</span>
        </button>
      ))}
    </div>
  );
};

export default DashboardQuickActions;
