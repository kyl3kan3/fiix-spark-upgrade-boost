
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Search,
  Menu,
  Settings,
  MessageSquare,
  LogOut,
  ChevronDown,
  HelpCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { toast } from "sonner";
import DashboardSidebar from "./DashboardSidebar";
import DashboardNotifications from "./DashboardNotifications";
import { getUserNotifications } from "@/services/notificationService";

interface DashboardHeaderProps {
  userName?: string;
}

const DashboardHeader = ({ userName = "Admin User" }: DashboardHeaderProps) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotificationsCount, setUnreadNotificationsCount] = useState(0);
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false);

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
  
  const handleLogout = () => {
    toast.info("You have been logged out");
    // Here you would typically clear user session
  };

  return (
    <header className="border-b bg-white sticky top-0 z-30">
      <div className="px-4 sm:px-6 lg:px-8 flex h-14 items-center justify-between">
        <div className="flex items-center">
          <Sheet>
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
              <DashboardSidebar />
            </SheetContent>
          </Sheet>

          <div className="hidden md:flex mr-4">
            <Link to="/dashboard" className="text-xl font-bold text-maintenease-700">
              MaintenEase
            </Link>
          </div>

          <div className="relative w-full max-w-md hidden md:flex items-center">
            <Search className="absolute left-2.5 h-4 w-4 text-gray-500" />
            <Input
              type="search"
              placeholder="Search..."
              className="w-full bg-white pl-8 py-1"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Link to="/chat">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Chat"
              className="relative"
            >
              <MessageSquare className="h-5 w-5" />
            </Button>
          </Link>
          
          <Button
            variant="ghost"
            size="icon"
            aria-label="Notifications"
            className="relative"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell className="h-5 w-5" />
            {unreadNotificationsCount > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center"
              >
                {unreadNotificationsCount}
              </Badge>
            )}
          </Button>
          
          <DashboardNotifications 
            isOpen={showNotifications} 
            setIsOpen={setShowNotifications} 
            onNotificationCountChange={handleNotificationCountChange}
          />

          <Link to="/help">
            <Button
              variant="ghost"
              size="icon"
              aria-label="Help"
              className="hidden sm:flex"
            >
              <HelpCircle className="h-5 w-5" />
            </Button>
          </Link>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                className="p-1 sm:flex gap-2 items-center justify-between"
              >
                <Avatar className="h-8 w-8 border">
                  <AvatarImage alt={userName} />
                  <AvatarFallback className="text-xs bg-maintenease-50 text-maintenease-600">
                    {userName
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden md:flex items-center gap-1">
                  <span className="text-sm font-medium line-clamp-1">
                    {userName}
                  </span>
                  <ChevronDown size={16} />
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile" className="cursor-pointer">
                  Profile
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings" className="cursor-pointer">
                  <Settings size={16} className="mr-2" />
                  Settings
                </Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout}>
                <LogOut size={16} className="mr-2" />
                Logout
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
