import React from "react";
import { NavLink } from "react-router-dom";
import { LayoutDashboard, ClipboardList, ClipboardCheck, Calendar, BarChart3, Menu, Package } from "lucide-react";
import { cn } from "@/lib/utils";
import { TIER_FEATURES, useSubscription } from "@/hooks/useSubscription";

interface Props {
 onOpenMenu: () => void;
}

const coreItems = [
 { label: "Home", href: "/dashboard", icon: LayoutDashboard },
 { label: "Work Orders", href: "/work-orders", icon: ClipboardList },
 { label: "Check-Ups", href: "/inspections", icon: ClipboardCheck },
 { label: "Calendar", href: "/calendar", icon: Calendar },
];

const MobileBottomNav: React.FC<Props> = ({ onOpenMenu }) => {
 const { data: subscription } = useSubscription();
 const hasAnalytics = Boolean(
 subscription?.is_active && TIER_FEATURES[subscription.tier].analytics,
 );
 const items = [
   ...coreItems,
   { label: "Assets", href: "/assets", icon: Package },
   ...(hasAnalytics
     ? [{ label: "Analytics", href: "/reports", icon: BarChart3 }]
     : []),
 ];
 const navColumns = items.length + 1;

 const cell =
 "relative flex flex-col items-center justify-center gap-1 pt-2.5 pb-1.5 px-1 text-[11px] font-semibold leading-none transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring";

 return (
 <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-card border-t border-border pb-safe">
 <div
   className="grid"
   style={{ gridTemplateColumns: `repeat(${navColumns}, minmax(0, 1fr))` }}
 >
 {items.map((it) => {
 const Icon = it.icon;
 return (
 <NavLink
 key={it.href}
 to={it.href}
 className={({ isActive }) =>
 cn(
 cell,
 isActive
 ? "text-foreground before:absolute before:top-0 before:left-3 before:right-3 before:h-[3px] before:rounded-b-full before:bg-highlight"
 : "text-muted-foreground hover:text-foreground"
 )
 }
 >
 {({ isActive }) => (
 <>
 <Icon className="h-5 w-5" strokeWidth={isActive ? 2.4 : 2} />
 <span>{it.label}</span>
 </>
 )}
 </NavLink>
 );
 })}
 <button
 onClick={onOpenMenu}
 className={cn(cell, "text-muted-foreground hover:text-foreground")}
 >
 <Menu className="h-5 w-5" strokeWidth={2} />
 <span aria-label="More navigation options">More</span>
 </button>
 </div>
 </nav>
 );
};

export default MobileBottomNav;
