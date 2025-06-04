
import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import DashboardSidebar from "./DashboardSidebar";
import DashboardNotifications from "./DashboardNotifications";
import { getUserNotifications } from "@/services/notifications";
import NotificationSound, { NotificationSoundHandle } from "@/components/ui/NotificationSound";
import SearchBar from "./header/SearchBar";
import HeaderActions from "./header/HeaderActions";
import ProfileMenu from "./header/ProfileMenu";
import { supabase } from "@/integrations/supabase/client";

interface DashboardHeaderProps {
  userName?: string;
}

const DashboardHeader = ({ userName = "Admin User" }: DashboardHeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  // Notification sound ref
  const notificationSoundRef = useRef<NotificationSoundHandle>(null);

  // This ensures the notifications panel closes when we navigate away
  const handleCloseNotifications = () => {
    setShowNotifications(false);
  };
  
  // Handler for notification count changes
  const handleNotificationCountChange = (count: number) => {
    setUnreadNotificationsCount(count);
  };
  
  // Fetch notifications count on component mount
  useEffect(() => {
    const fetchNotificationsCount = async () => {
      try {
        const notifications = await getUserNotifications();
        const unreadCount = notifications.filter(n => !n.read).length;
        setUnreadNotificationsCount(unreadCount);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };
    
    fetchNotificationsCount();
  }, []);
  
  // Check notification preferences when component mounts
  useEffect(() => {
    const storedPreferences = localStorage.getItem('notificationPreferences');
    if (storedPreferences) {
      const preferences = JSON.parse(storedPreferences);
      const pushSetting = preferences.find((p: any) => p.title === "Push Notifications");
      if (pushSetting) {
        setPushNotificationsEnabled(pushSetting.enabled);
      }
    }
  }, []);
  
  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("You have been logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  // Called by child when new notification arrives (via event handler prop)
  const handleNewNotification = () => {
    // Optionally play notification sound
    if (notificationSoundRef.current) {
      // You could check user prefs here to enable/disable sound
      notificationSoundRef.current.play();
    }
  };

  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
  };

  return (
    <header className="border-b bg-white sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden mr-1"
                aria-label="Menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="p-0 w-64">
              <DashboardSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
            </SheetContent>
          </Sheet>

          <div className="hidden md:flex mr-4">
            <Link to="/dashboard" className="text-xl font-bold text-maintenease-700">
              MaintenEase
            </Link>
          </div>

          <SearchBar />
        </div>

        <div className="flex items-center gap-2">
          <HeaderActions 
            unreadNotificationsCount={unreadNotificationsCount}
            toggleNotifications={toggleNotifications}
            notificationSoundRef={notificationSoundRef}
          />
          
          <DashboardNotifications 
            isOpen={showNotifications} 
            setIsOpen={setShowNotifications} 
            onNotificationCountChange={setUnreadNotificationsCount}
            onNewNotification={handleNewNotification}
          />

          <ProfileMenu 
            userName={userName}
            onLogout={handleLogout}
          />
        </div>
      </div>

      <NotificationSound ref={notificationSoundRef} />
    </header>
  );
};

export default DashboardHeader;
