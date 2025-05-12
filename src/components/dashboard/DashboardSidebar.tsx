
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
  ChevronRight
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/ui/sidebar";

const DashboardSidebar = () => {
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;
  const [isCollapsed, setIsCollapsed] = useState(false);
  
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };
  
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
      name: "Help",
      href: "/help",
      icon: <LifeBuoy className="h-5 w-5" />,
      isActive: isActive("/help"),
    },
  ];

  return (
    <Sidebar>
      <div className={`${isCollapsed ? 'w-20' : 'w-64'} transition-all duration-300 hidden lg:flex flex-col bg-white border-r border-gray-200 p-4 h-full`}>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={toggleSidebar} 
          className="absolute -right-3 top-20 bg-white border border-gray-200 rounded-full shadow-sm hover:bg-gray-50"
        >
          {isCollapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
        </Button>
        
        <div className="mt-8 flex flex-col flex-grow">
          <nav className="flex-1 space-y-1">
            {sidebarItems.map((item) => (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                  item.isActive
                    ? "bg-maintenease-50 text-maintenease-700"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
              >
                <span
                  className={`${
                    item.isActive ? "text-maintenease-600" : "text-gray-500"
                  } ${isCollapsed ? 'mr-0' : 'mr-3'}`}
                >
                  {item.icon}
                </span>
                {!isCollapsed && item.name}
              </Link>
            ))}
          </nav>
          <div className="mt-auto pb-8">
            <Link
              to="/dashboard?tab=settings"
              className={`flex items-center px-4 py-3 text-sm font-medium rounded-md transition-colors ${
                location.pathname === "/dashboard" && location.search.includes("tab=settings")
                  ? "bg-maintenease-50 text-maintenease-700"
                  : "text-gray-700 hover:bg-gray-100"
              }`}
            >
              <span
                className={`${
                  location.pathname === "/dashboard" && location.search.includes("tab=settings")
                    ? "text-maintenease-600"
                    : "text-gray-500"
                } ${isCollapsed ? 'mr-0' : 'mr-3'}`}
              >
                <Settings className="h-5 w-5" />
              </span>
              {!isCollapsed && "Settings"}
            </Link>
          </div>
        </div>
      </div>
    </Sidebar>
  );
};

export default DashboardSidebar;
