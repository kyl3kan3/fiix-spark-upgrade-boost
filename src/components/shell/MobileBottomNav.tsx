import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList, ClipboardCheck, Calendar, Menu } from "lucide-react";
import { cn } from "@/lib/utils";

interface Props {
  onOpenMenu: () => void;
}

const items = [
  { label: "Home",      href: "/dashboard",   icon: LayoutDashboard },
  { label: "My Jobs",   href: "/work-orders", icon: ClipboardList },
  { label: "Check-Ups", href: "/inspections", icon: ClipboardCheck },
  { label: "Calendar",  href: "/calendar",    icon: Calendar },
];

const MobileBottomNav: React.FC<Props> = ({ onOpenMenu }) => {
  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card/95 backdrop-blur-md border-t border-border pb-safe">
      <div className="grid grid-cols-5 px-1 pt-1.5">
        {items.map((it) => {
          const Icon = it.icon;
          return (
            <NavLink
              key={it.href}
              to={it.href}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground"
                )
              }
            >
              {({ isActive }) => (
                <>
                  <div className={cn(
                    "h-9 w-12 flex items-center justify-center rounded-2xl transition-all",
                    isActive && "bg-primary/15"
                  )}>
                    <Icon className="h-5 w-5" strokeWidth={isActive ? 2.6 : 2.2} />
                  </div>
                  <span className="text-[11px] font-bold leading-none">{it.label}</span>
                </>
              )}
            </NavLink>
          );
        })}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center gap-1 py-2 px-1 rounded-2xl text-muted-foreground hover:text-foreground"
        >
          <div className="h-9 w-12 flex items-center justify-center rounded-2xl">
            <Menu className="h-5 w-5" strokeWidth={2.2} />
          </div>
          <span className="text-[11px] font-bold leading-none">More</span>
        </button>
      </div>
    </nav>
  );
};

export default MobileBottomNav;
