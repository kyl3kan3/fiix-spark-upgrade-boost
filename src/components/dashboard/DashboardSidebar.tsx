
import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  BarChart2,
  Calendar,
  FileText,
  Home,
  LayoutDashboard,
  LifeBuoy,
  Settings,
  Wrench,
  Users,
  CheckSquare,
  ChevronLeft,
  ChevronRight,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar
} from "@/components/ui/sidebar";

const DashboardSidebar = () => {
  const location = useLocation();
  const { state: sidebarState, toggleSidebar } = useSidebar();
  const isCollapsed = sidebarState === "collapsed";
  
  const isActive = (path: string) => location.pathname === path;
  
  const sidebarItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
      isActive: isActive("/dashboard"),
    },
    {
      name: "Work Orders",
      href: "/work-orders",
      icon: <FileText className="h-5 w-5" />,
      isActive: location.pathname.includes("/work-orders"),
    },
    {
      name: "Inspections",
      href: "/inspections",
      icon: <CheckSquare className="h-5 w-5" />,
      isActive: location.pathname.includes("/inspections"),
    },
    {
      name: "Assets",
      href: "/assets",
      icon: <Wrench className="h-5 w-5" />,
      isActive: location.pathname.includes("/assets"),
    },
    {
      name: "Calendar",
      href: "/calendar",
      icon: <Calendar className="h-5 w-5" />,
      isActive: location.pathname.includes("/calendar"),
    },
    {
      name: "Reports",
      href: "/reports",
      icon: <BarChart2 className="h-5 w-5" />,
      isActive: isActive("/reports"),
    },
    {
      name: "Team",
      href: "/team",
      icon: <Users className="h-5 w-5" />,
      isActive: isActive("/team"),
    },
    {
      name: "Chat",
      href: "/chat",
      icon: <MessageSquare className="h-5 w-5" />,
      isActive: isActive("/chat"),
    },
    {
      name: "Help",
      href: "/help",
      icon: <LifeBuoy className="h-5 w-5" />,
      isActive: isActive("/help"),
    },
  ];

  return (
    <Sidebar>
      <SidebarContent>
        <div className="mt-6 px-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className={`font-semibold text-lg ${isCollapsed ? 'hidden' : 'block'}`}>
              MaintenEase
            </h2>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className="hover:bg-gray-100"
            >
              {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
            </Button>
          </div>
          
          <SidebarMenu>
            {sidebarItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton 
                  asChild
                  isActive={item.isActive}
                  tooltip={isCollapsed ? item.name : undefined}
                >
                  <Link to={item.href} className="flex items-center">
                    <span>{item.icon}</span>
                    {!isCollapsed && <span className="ml-3">{item.name}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            
            <SidebarMenuItem>
              <SidebarMenuButton 
                asChild
                isActive={isActive("/setup")}
                tooltip={isCollapsed ? "Setup" : undefined}
              >
                <Link to="/setup" className="flex items-center">
                  <span><Settings className="h-5 w-5" /></span>
                  {!isCollapsed && <span className="ml-3">Setup</span>}
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>
    </Sidebar>
  );
};

export default DashboardSidebar;
