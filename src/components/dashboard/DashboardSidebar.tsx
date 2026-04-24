import React from "react";
import {
  LayoutDashboard, List, Users, Settings, Package, Building, Building2,
  ClipboardCheck, Wrench, Calendar, BarChart3, ListChecks, LogOut, Sparkles,
} from "lucide-react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent,
  SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";

interface DashboardSidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

const sections = [
  {
    label: "Overview",
    items: [{ icon: LayoutDashboard, label: "Dashboard", href: "/dashboard" }],
  },
  {
    label: "Operations",
    items: [
      { icon: List, label: "Work Orders", href: "/work-orders" },
      { icon: ClipboardCheck, label: "Inspections", href: "/inspections" },
      { icon: Wrench, label: "Maintenance", href: "/maintenance" },
      { icon: ListChecks, label: "Checklists", href: "/checklists" },
    ],
  },
  {
    label: "Assets & Locations",
    items: [
      { icon: Package, label: "Assets", href: "/assets" },
      { icon: Building, label: "Locations", href: "/locations" },
    ],
  },
  {
    label: "Planning",
    items: [
      { icon: Calendar, label: "Calendar", href: "/calendar" },
      { icon: BarChart3, label: "Reports", href: "/reports" },
    ],
  },
  {
    label: "Collaboration",
    items: [
      { icon: Users, label: "Team", href: "/team" },
      { icon: Building2, label: "Vendors", href: "/vendors" },
    ],
  },
  {
    label: "System",
    items: [{ icon: Settings, label: "Settings", href: "/settings" }],
  },
];

const DashboardSidebar: React.FC<DashboardSidebarProps> = () => {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { profile } = useUserProfile();
  const { state } = useSidebar();
  const collapsed = state === "collapsed";

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const initial =
    profile?.first_name?.charAt(0).toUpperCase() ||
    profile?.email?.charAt(0).toUpperCase() ||
    "U";

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader className="border-b border-sidebar-border">
        <div className={cn("flex items-center gap-2.5 px-2 py-2", collapsed && "justify-center px-0")}>
          <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gradient-primary shadow-glow">
            <Sparkles className="h-4 w-4 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="flex flex-col leading-tight">
              <span className="font-semibold tracking-tight text-sidebar-foreground">MaintenEase</span>
              <span className="text-[11px] text-muted-foreground">Operations Suite</span>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2 py-3">
        {sections.map((section) => (
          <SidebarGroup key={section.label} className="py-1">
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground/70 px-2">
                {section.label}
              </SidebarGroupLabel>
            )}
            <SidebarGroupContent>
              <SidebarMenu>
                {section.items.map((item) => {
                  const active = pathname === item.href;
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        asChild
                        tooltip={item.label}
                        className={cn(
                          "h-9 rounded-lg transition-colors",
                          active &&
                            "bg-gradient-to-r from-primary/15 to-primary/5 text-primary font-medium hover:from-primary/20 hover:to-primary/10"
                        )}
                      >
                        <NavLink to={item.href}>
                          <item.icon className={cn("h-[18px] w-[18px]", active && "text-primary")} />
                          <span>{item.label}</span>
                          {active && !collapsed && (
                            <span className="ml-auto h-1.5 w-1.5 rounded-full bg-primary shadow-glow" />
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      <SidebarFooter className="border-t border-sidebar-border p-2">
        <div
          className={cn(
            "flex items-center gap-2.5 rounded-lg p-2 hover:bg-sidebar-accent/60 transition-colors cursor-pointer",
            collapsed && "justify-center"
          )}
          onClick={() => navigate("/profile")}
        >
          <Avatar className="h-8 w-8 ring-2 ring-primary/20">
            <AvatarImage src={profile?.avatar_url || ""} alt={profile?.first_name || "Avatar"} />
            <AvatarFallback className="bg-gradient-primary text-primary-foreground text-xs font-semibold">
              {initial}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-sidebar-foreground truncate">
                {profile?.first_name || "User"} {profile?.last_name || ""}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">{profile?.email}</p>
            </div>
          )}
          {!collapsed && (
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 shrink-0 hover:bg-destructive/10 hover:text-destructive"
              onClick={(e) => {
                e.stopPropagation();
                handleLogout();
              }}
            >
              <LogOut className="h-3.5 w-3.5" />
            </Button>
          )}
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
