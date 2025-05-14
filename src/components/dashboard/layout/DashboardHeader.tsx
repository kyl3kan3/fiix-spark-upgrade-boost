
import React from "react";
import { User, Bell } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardHeaderProps {
  unreadCount: number;
  toggleNotifications: () => void;
}

const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  unreadCount,
  toggleNotifications,
}) => {
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <header className="sticky top-0 z-50 glass-morphism dark:glass-morphism-dark border-b border-gray-200 dark:border-gray-700 shadow-md shadow-maintenease-100/10">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center">
          <SidebarTrigger>
            <Button variant="ghost" size="icon" className="mr-2 md:hidden">
              <span className="sr-only">Toggle menu</span>
            </Button>
          </SidebarTrigger>
        </div>
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={toggleNotifications}
            className="relative"
          >
            <Bell className="h-5 w-5" />
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
            className="flex items-center gap-2"
          >
            <User className="h-4 w-4" />
            <span>Profile</span>
          </Button>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
