
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator
} from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  BarChart2,
  ListChecks,
  Settings,
  Clipboard,
  Users,
  LogOut,
  HelpCircle,
  Calendar,
  Wrench,
  FileText
} from "lucide-react";

const DashboardSidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const pathname = location.pathname;

  const mainMenuItems = [
    {
      icon: LayoutDashboard,
      label: "Overview",
      value: "overview",
      onClick: () => navigate("/dashboard")
    },
    {
      icon: BarChart2,
      label: "Analytics",
      value: "analytics",
      onClick: () => navigate("/dashboard?tab=analytics")
    },
    {
      icon: ListChecks,
      label: "Tasks",
      value: "tasks",
      onClick: () => navigate("/dashboard?tab=tasks")
    },
    {
      icon: Settings,
      label: "Settings",
      value: "settings",
      onClick: () => navigate("/dashboard?tab=settings")
    }
  ];

  const secondaryMenuItems = [
    {
      icon: Clipboard,
      label: "Work Orders",
      onClick: () => navigate("/feature/Work%20Order%20Management")
    },
    {
      icon: Calendar,
      label: "Maintenance",
      onClick: () => navigate("/feature/Preventive%20Maintenance")
    },
    {
      icon: Wrench,
      label: "Assets",
      onClick: () => navigate("/assets")
    },
    {
      icon: FileText,
      label: "Reports",
      onClick: () => navigate("/feature/Reports")
    },
    {
      icon: Users,
      label: "Team",
      onClick: () => navigate("/team")
    }
  ];

  const isActive = (value: string) => {
    if (pathname === "/dashboard") {
      const params = new URLSearchParams(location.search);
      const tab = params.get("tab") || "overview";
      return tab === value;
    }
    return false;
  };

  return (
    <Sidebar>
      <SidebarHeader>
        <div className="p-2">
          <h2 className="text-xl font-bold text-maintenease-600 px-2 py-3">MaintenEase</h2>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        <SidebarMenu>
          {mainMenuItems.map((item) => (
            <SidebarMenuItem key={item.value}>
              <SidebarMenuButton
                isActive={isActive(item.value)}
                tooltip={item.label}
                onClick={item.onClick}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>

        <SidebarSeparator className="my-4" />
        
        <SidebarMenu>
          {secondaryMenuItems.map((item) => (
            <SidebarMenuItem key={item.label}>
              <SidebarMenuButton
                tooltip={item.label}
                onClick={item.onClick}
              >
                <item.icon />
                <span>{item.label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Help"
              onClick={() => navigate("/help")}
            >
              <HelpCircle />
              <span>Help</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              tooltip="Logout"
              onClick={() => navigate("/")}
            >
              <LogOut />
              <span>Logout</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
};

export default DashboardSidebar;
