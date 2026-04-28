import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, CalendarDays, Wrench, CheckSquare, FileBarChart } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";

const DashboardQuickActions: React.FC = () => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const actions = [
    { title: "Report a Problem", icon: FileText,     href: "/work-orders/new", tone: "primary" },
    { title: "Start a Check-Up", icon: CheckSquare,  href: "/inspections",     tone: "accent" },
    { title: "View Calendar",    icon: CalendarDays, href: "/calendar",        tone: "muted" },
    { title: "Equipment",        icon: Wrench,       href: "/assets",          tone: "muted" },
    { title: "Reports",          icon: FileBarChart, href: "/reports",         tone: "muted" },
  ];
  const visible = isMobile ? actions.slice(0, 3) : actions;

  const toneStyles: Record<string, string> = {
    primary: "bg-gradient-primary text-primary-foreground border-transparent hover:opacity-95",
    accent:  "bg-accent text-accent-foreground border-transparent hover:opacity-95",
    muted:   "bg-card text-foreground border-border hover:border-primary/40",
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
      {visible.map(({ title, icon: Icon, href, tone }) => (
        <button
          key={title}
          onClick={() => navigate(href)}
          className={`group text-left p-5 rounded-3xl border-2 transition-all min-h-[120px] flex flex-col justify-between shadow-soft ${toneStyles[tone]}`}
        >
          <Icon className="h-7 w-7" strokeWidth={2.2} />
          <span className="block font-display text-base font-bold leading-tight mt-3">{title}</span>
        </button>
      ))}
    </div>
  );
};

export default DashboardQuickActions;
