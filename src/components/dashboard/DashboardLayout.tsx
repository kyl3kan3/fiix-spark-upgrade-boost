
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import DashboardSidebar from "./DashboardSidebar";
import DashboardNotifications from "./DashboardNotifications";
import DashboardHeader from "./layout/DashboardHeader";
import GradientBackground from "./layout/GradientBackground";
import ContentContainer from "./layout/ContentContainer";
import { getUserNotifications } from "@/services/notifications";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  
  useEffect(() => {
    // Check if dark mode is enabled in localStorage when component mounts
    const storedSettings = localStorage.getItem('displaySettings');
    if (storedSettings) {
      try {
        const settings = JSON.parse(storedSettings);
        const darkModeSetting = settings.find((s: any) => s.id === "darkMode");
        if (darkModeSetting && darkModeSetting.enabled) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      } catch (e) {
        console.error("Error parsing display settings:", e);
      }
    }
    
    // Fetch notifications count on component mount
    fetchNotificationsCount();
  }, []);
  
  const fetchNotificationsCount = async () => {
    setIsLoading(true);
    try {
      const notifications = await getUserNotifications();
      const unreadCount = notifications.filter(n => !n.read).length;
      setUnreadCount(unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      // Don't show toast for notification errors - non-critical
    } finally {
      setIsLoading(false);
    }
  };
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      toast.info("Notifications panel opened");
    }
  };
  
  const handleNotificationCountChange = (count: number) => {
    setUnreadCount(count);
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full relative overflow-x-clip">
        <GradientBackground />
        <DashboardSidebar />
        <SidebarInset className="flex flex-col flex-1">
          <DashboardHeader 
            unreadCount={unreadCount} 
            toggleNotifications={toggleNotifications} 
          />
          
          <ContentContainer>
            {children}
            
            <DashboardNotifications 
              isOpen={showNotifications}
              setIsOpen={setShowNotifications}
              onNotificationCountChange={handleNotificationCountChange}
            />
          </ContentContainer>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
