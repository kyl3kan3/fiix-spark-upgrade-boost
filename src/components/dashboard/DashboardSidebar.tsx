
import React from "react";
import {
  LayoutDashboard,
  List,
  Users,
  Settings,
  Package,
  Building,
  Building2
} from "lucide-react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader, 
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarSeparator
} from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUserProfile } from "@/hooks/useUserProfile";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const DashboardSidebar: React.FC<DashboardSidebarProps> = ({ isOpen, onClose }) => {
  const { logout } = useAuth();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { profile, isLoading } = useUserProfile();
  const isMobile = useIsMobile();

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

  const SidebarContentComponent = () => (
    <>
      <SidebarHeader>
        <Link to="/dashboard" className="flex items-center px-6 py-4 font-semibold">
          <LayoutDashboard className="mr-2 h-5 w-5" />
          MaintenEase
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.label}>
                  <SidebarMenuButton 
                    asChild
                    isActive={pathname === item.href}
                  >
                    <Link
                      to={item.href}
                      onClick={() => isMobile && onClose()}
                    >
                      <item.icon className="h-4 w-4" />
                      <span>{item.label}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarSeparator />

      <SidebarFooter>
        <div className="p-6">
          <div className="flex items-center mb-4">
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
      </SidebarFooter>
    </>
  );

  // On mobile, render as a Sheet
  if (isMobile) {
    return (
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent side="left" className="w-64 p-0">
          <div className="flex flex-col h-full">
            <SidebarContentComponent />
          </div>
        </SheetContent>
      </Sheet>
    );
  }

  // On desktop, render as Shadcn Sidebar
  return (
    <Sidebar>
      <SidebarContentComponent />
    </Sidebar>
  );
};

export default DashboardSidebar;
