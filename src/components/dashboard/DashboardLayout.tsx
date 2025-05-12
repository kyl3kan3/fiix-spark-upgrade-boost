
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Bell, Menu, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardNotifications from "./DashboardNotifications";
import DashboardSidebar from "./DashboardSidebar";
import { SidebarProvider, SidebarInset, SidebarTrigger } from "@/components/ui/sidebar";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const navigate = useNavigate();
  
  const toggleNotifications = () => {
    setShowNotifications(!showNotifications);
    if (!showNotifications) {
      toast.info("Notifications panel opened");
    }
  };

  const handleProfileClick = () => {
    navigate("/profile");
  };

  return (
    <SidebarProvider defaultOpen={true}>
      <div className="flex min-h-screen w-full bg-gray-50">
        <DashboardSidebar />
        
        <SidebarInset className="flex flex-col flex-1">
          <header className="bg-white border-b border-gray-200">
            <div className="container mx-auto px-4 flex items-center justify-between h-16">
              <div className="flex items-center">
                <SidebarTrigger>
                  <Button variant="ghost" size="icon" className="mr-2">
                    <Menu className="h-5 w-5" />
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
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
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
          
          <div className="container mx-auto px-4 pt-8 flex-1">
            {children}
            
            {/* Notifications Panel */}
            {showNotifications && <DashboardNotifications />}
          </div>
        </SidebarInset>
      </div>
    </SidebarProvider>
  );
};

export default DashboardLayout;
