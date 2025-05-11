
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
  Users
} from "lucide-react";

const DashboardSidebar = () => {
  const location = useLocation();
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
    <div className="hidden lg:flex flex-col w-64 bg-white border-r border-gray-200 p-4 fixed top-0 bottom-0 pt-16">
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
                className={`mr-3 ${
                  item.isActive ? "text-maintenease-600" : "text-gray-500"
                }`}
              >
                {item.icon}
              </span>
              {item.name}
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
              className={`mr-3 ${
                location.pathname === "/dashboard" && location.search.includes("tab=settings")
                  ? "text-maintenease-600"
                  : "text-gray-500"
              }`}
            >
              <Settings className="h-5 w-5" />
            </span>
            Settings
          </Link>
        </div>
      </div>
    </div>
  );
};

export default DashboardSidebar;
