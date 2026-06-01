import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { LogOut, Moon, Plus, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { useAuth } from "@/providers/AuthContext";
import { cn } from "@/lib/utils";
import { NAV_ITEMS } from "./navConfig";
import { useSubscription, TIER_FEATURES } from "@/hooks/useSubscription";

interface IconRailProps {
 onOpenPalette: () => void;
}

const IconRail: React.FC<IconRailProps> = () => {
 const navigate = useNavigate();
 const { profile } = useUserProfile();
 const { logout } = useAuth();
 const { theme, setTheme } = useTheme();
 const { data: sub } = useSubscription();

 const initial =
 profile?.first_name?.charAt(0).toUpperCase() ||
 profile?.email?.charAt(0).toUpperCase() ||
 "U";

 const handleLogout = async () => {
 await logout();
 navigate("/auth");
 };

 // Filter items by tier feature
 const visibleItems = NAV_ITEMS.filter((item) => {
 if (!item.feature) return true;
 if (!sub) return false;
 if (!sub.is_active) return false;
 return TIER_FEATURES[sub.tier][item.feature];
 });

 // Group items
 const grouped: Array<{ name: string; items: typeof NAV_ITEMS }> = [];
 visibleItems.forEach((item) => {
 const last = grouped[grouped.length - 1];
 if (!last || last.name !== item.group) {
 grouped.push({ name: item.group, items: [item] });
 } else {
 last.items.push(item);
 }
 });

 return (
 <aside className="hidden lg:flex flex-col w-[240px] shrink-0 bg-sidebar text-sidebar-foreground border-r border-sidebar-border h-screen fixed left-0 top-0 z-40">
 {/* Brand — Clean Tech: serif headline, no gradient block */}
 <div className="px-6 pt-6 pb-4">
 <NavLink to="/dashboard" className="block">
 <h1 className="font-headline text-2xl font-bold text-primary tracking-tight">MaintenEase</h1>
 <p className="text-xs text-muted-foreground font-medium mt-0.5">Facility Management</p>
 </NavLink>
 </div>

 {/* Primary CTA — Clean Tech */}
 <div className="px-6 mb-4">
 <button
 onClick={() => navigate("/work-orders/new")}
 className="w-full inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground py-2.5 rounded-lg text-sm font-semibold shadow-sm hover:bg-primary-variant transition-colors"
 >
 <Plus className="h-4 w-4" />
 New Work Order
 </button>
 </div>

 {/* Nav */}
 <nav className="flex-1 min-h-0 overflow-y-auto px-3 pb-4">
 {grouped.map((group) => (
 <div key={group.name} className="mb-4 last:mb-0">
 <div className="label-eyebrow px-3 mb-1.5">{group.name}</div>
 {group.items.map((item) => {
 const Icon = item.icon;
 return (
 <NavLink
 key={item.href}
 to={item.href}
 data-tour={`nav-${item.href.replace(/^\//, "").replace(/\//g, "-")}`}
 className={({ isActive }) =>
 cn(
 "flex items-center gap-3 h-10 pl-3 pr-3 my-0.5 rounded-r-lg transition-colors duration-200 text-sm font-medium border-l-4 border-transparent",
 "text-sidebar-foreground hover:bg-sidebar-accent",
 isActive && "border-primary bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
 )
 }
 >
 <Icon className="h-[18px] w-[18px] shrink-0" strokeWidth={2} />
 <span className="truncate">{item.label}</span>
 </NavLink>
 );
 })}
 </div>
 ))}
 </nav>

 {/* Footer — Clean Tech: profile + Support/Logout slots */}
 <div className="border-t border-sidebar-border p-3 space-y-1">
 <button
 onClick={() => navigate("/profile")}
 className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
 >
 <Avatar className="h-9 w-9">
 <AvatarImage src={profile?.avatar_url || ""} alt={profile?.first_name || "User"} />
 <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">
 {initial}
 </AvatarFallback>
 </Avatar>
 <div className="flex flex-col items-start leading-tight min-w-0 flex-1">
 <span className="text-sm font-semibold text-foreground truncate w-full text-left">
 {profile?.first_name || profile?.email?.split("@")[0] || "Welcome"}
 </span>
 <span className="text-xs text-muted-foreground truncate w-full text-left">View profile</span>
 </div>
 </button>

 <div className="flex gap-1">
 <button
 onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
 className="flex-1 h-9 flex items-center justify-center gap-2 rounded-lg text-xs font-medium text-sidebar-foreground hover:bg-sidebar-accent transition-colors"
 >
 {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
 <span>{theme === "dark" ? "Light" : "Dark"}</span>
 </button>
 <button
 onClick={handleLogout}
 className="flex-1 h-9 flex items-center justify-center gap-2 rounded-lg text-xs font-medium text-sidebar-foreground hover:bg-destructive hover:text-destructive-foreground transition-colors"
 >
 <LogOut className="h-4 w-4" />
 <span>Sign out</span>
 </button>
 </div>
 </div>
 </aside>
 );
};

export default IconRail;
