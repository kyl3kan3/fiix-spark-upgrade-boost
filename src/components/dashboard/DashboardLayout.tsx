
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardNotifications from "./DashboardNotifications";
import DashboardSidebar from "./DashboardSidebar";
import { 
  SidebarProvider, 
  SidebarInset, 
  SidebarTrigger 
} from "@/components/ui/sidebar";
import { getUserNotifications } from "@/services/notificationService";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  
  useEffect(() => {
    // Check if dark mode is enabled in localStorage when component mounts
    const storedSettings = localStorage.getItem('displaySettings');
    if (storedSettings) {
      const settings = JSON.parse(storedSettings);
      const darkModeSetting = settings.find((s: any) => s.id === "darkMode");
      if (darkModeSetting && darkModeSetting.enabled) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
    
    // Fetch notifications count on component mount
    const fetchNotificationsCount = async () => {
      try {
        const notifications = await getUserNotifications();
        const unreadCount = notifications.filter(n => !n.read).length;
        setUnreadCount(unreadCount);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    
    fetchNotificationsCount();
  }, []);
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      toast.info("Notifications panel opened");
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };
  
  const handleNotificationCountChange = (count: number) => {
    setUnreadCount(count);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gray-50 dark:bg-gray-900">
        <DashboardSidebar />
        
        <SidebarInset className="flex flex-col flex-1">
          <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
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
          
          <div className="container mx-auto px-4 pt-8 flex-1 dark:bg-gray-900">
            {children}
            
            {/* Notifications Panel */}
            <DashboardNotifications 
              isOpen={showNotifications}
              setIsOpen={setShowNotifications}
              onNotificationCountChange={handleNotificationCountChange}
            />
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
