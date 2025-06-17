import React from "react";
import {
  LayoutDashboard,
  List,
  Users,
  Settings,
  Package,
  Building,
  Building2,
  ClipboardCheck,
  Wrench,
  Calendar
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { profile, isLoading } = useUserProfile();

  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };

  const menuItems = [
    {
      icon: LayoutDashboard,
      label: "Dashboard",
      href: "/dashboard",
      description: "Overview of your account"
    },
    {
      icon: List,
      label: "Work Orders",
      href: "/work-orders",
      description: "Manage maintenance tasks"
    },
    {
      icon: Package,
      label: "Assets",
      href: "/assets",
      description: "Track equipment and inventory"
    },
    {
      icon: ClipboardCheck,
      label: "Inspections",
      href: "/inspections",
      description: "Schedule and manage inspections"
    },
    {
      icon: Calendar,
      label: "Calendar",
      href: "/calendar",
      description: "View scheduled events"
    },
    {
      icon: Wrench,
      label: "Maintenance",
      href: "/maintenance",
      description: "Preventive maintenance scheduling"
    },
    {
      icon: Building2,
      label: "Vendors",
      href: "/vendors",
      description: "Manage vendor relationships"
    },
    {
      icon: Users,
      label: "Team",
      href: "/team",
      description: "Collaborate with your team"
    },
    {
      icon: Building,
      label: "Locations",
      href: "/locations",
      description: "Manage locations"
    },
    {
      icon: Settings,
      label: "Settings",
      href: "/settings",
      description: "Customize your experience"
    },
  ];

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-64 p-0 pt-6">
        <div className="flex flex-col h-full">
          <div className="px-6 mb-4">
            <Link to="/dashboard" className="flex items-center font-semibold">
              <LayoutDashboard className="mr-2 h-5 w-5" />
              MaintenEase
            </Link>
          </div>

          <Separator />

          <div className="flex-grow p-2">
            <ul className="space-y-1">
              {menuItems.map((item) => (
                <li key={item.label}>
                  <Link
                    to={item.href}
                    className={cn(
                      "flex items-center space-x-2 rounded-md p-2 text-sm font-medium hover:bg-secondary hover:text-secondary-foreground",
                      pathname === item.href
                        ? "bg-secondary text-secondary-foreground"
                        : "text-muted-foreground"
                    )}
                  >
                    <item.icon className="h-4 w-4" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Separator />

          <div className="p-6">
            <div className="mb-4">
              <Avatar className="h-8 w-8">
                <AvatarImage src={profile?.avatar_url || ""} alt={profile?.first_name || "Avatar"} />
                <AvatarFallback>{profile?.first_name?.charAt(0).toUpperCase() || profile?.email?.charAt(0).toUpperCase()}</AvatarFallback>
              </Avatar>
              <div className="ml-2 text-sm">
                <p className="font-medium">{profile?.first_name || "User"}</p>
                <p className="text-xs text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
            <Button variant="outline" className="w-full" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default DashboardSidebar;
