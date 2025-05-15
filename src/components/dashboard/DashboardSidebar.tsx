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
  MessageSquare,
  MapPin
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  useSidebar,
  SidebarRail
} from "@/components/ui/sidebar";
import { cn } from "@/lib/utils";

// A wrapper hook that safely uses the sidebar context or provides fallback values
const useSafeShidebar = () => {
  // Fallback state in case the provider is not available
  const [localState, setLocalState] = useState<"expanded" | "collapsed">("expanded");
  
  try {
    // Try to use the actual sidebar context
    return useSidebar();
  } catch (error) {
    // If context is not available, return fallback implementations
    return {
      state: localState,
      open: localState === "expanded",
      setOpen: (value: boolean) => setLocalState(value ? "expanded" : "collapsed"),
      isMobile: false,
      openMobile: false,
      setOpenMobile: () => {},
      toggleSidebar: () => setLocalState(prev => prev === "expanded" ? "collapsed" : "expanded")
    };
  }
};

const DashboardSidebar = () => {
  const location = useLocation();
  const { state: sidebarState, toggleSidebar } = useSafeShidebar();
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
    {
      name: "Locations",
      icon: MapPin,
      href: "/locations"
    }
  ];

  return (
    <Sidebar variant="inset">
      <SidebarContent>
        <div className="mt-6 px-2">
          <div className="flex items-center justify-between mb-4">
            <h2 className={cn("font-semibold text-lg", isCollapsed ? 'hidden' : 'block')}>
              MaintenEase
            </h2>
            
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleSidebar} 
              className="hover:bg-gray-100 transition-colors"
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
      
      {/* Make sure SidebarRail is present for the toggle functionality */}
      <SidebarRail />
    </Sidebar>
  );
};

export default DashboardSidebar;
