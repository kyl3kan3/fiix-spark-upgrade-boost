
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
    <header className="sticky top-0 z-40 bg-background/70 backdrop-blur-xl border-b border-border/60">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-14 md:h-16 max-w-[1440px]">
        <div className="flex items-center">
          <Button 
            variant="ghost" 
            size="icon" 
            className="mr-1 md:mr-2 hover:bg-accent"
            onClick={toggleSidebar}
          >
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle menu</span>
          </Button>
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-gradient-primary shadow-glow flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">M</span>
            </div>
            <span className="font-semibold tracking-tight hidden sm:inline">MaintenEase</span>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={toggleNotifications}
            className="relative hover:bg-accent"
          >
            <Bell className="h-[18px] w-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 bg-destructive text-destructive-foreground text-[10px] font-medium rounded-full h-4 min-w-4 px-1 flex items-center justify-center ring-2 ring-background">
                {unreadCount}
              </span>
            )}
          </Button>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={handleProfileClick}
            className="flex items-center gap-2 hover:bg-accent"
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
