
import React from "react";
import { User, Bell, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useIsMobile } from "@/hooks/use-mobile";

interface DashboardHeaderProps {
  unreadCount: number;
  toggleNotifications: () => void;
  toggleSidebar: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  unreadCount,
  toggleNotifications,
  toggleSidebar,
}) => {
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <header className="sticky top-0 z-50 glass-morphism dark:glass-morphism-dark border-b border-gray-200 dark:border-gray-700 shadow-md shadow-maintenease-100/10">
      <div className="container mx-auto px-3 md:px-4 flex items-center justify-between h-14 md:h-16">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-1 md:mr-2 md:hidden"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
        </div>
        <div className="flex items-center space-x-2 md:space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleNotifications}
            className="relative p-1 md:p-2"
          >
            <Bell className="h-4 w-4 md:h-5 md:w-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleProfileClick}
            className="flex items-center gap-1 md:gap-2 p-1 md:p-2"
          >
            <User className="h-4 w-4" />
            {!isMobile && <span>Profile</span>}
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
