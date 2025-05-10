
import React from "react";
import { useNavigate } from "react-router-dom";
import { Bell, LogOut, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import DashboardNotifications from "./DashboardNotifications";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  
  const handleLogout = () => {
    // For now just navigate to home page
    navigate("/");
  };
  
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard Header/Navigation */}
      <header className="bg-white border-b border-gray-200">
        <div className="container mx-auto px-4 flex items-center justify-between h-16">
          <div className="flex items-center">
            <span className="text-xl font-bold text-maintenease-600">MaintenEase</span>
          </div>
          <div className="flex items-center space-x-4">
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={() => {}}
              className="relative"
            >
              <Bell className="h-5 w-5" />
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-4 w-4 flex items-center justify-center">3</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm"
              onClick={() => navigate("/profile")}
              className="flex items-center gap-2"
            >
              <User className="h-4 w-4" />
              <span>Profile</span>
            </Button>
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleLogout}
              className="flex items-center gap-2"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </Button>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 pt-8">
        {children}
        
        {/* Notifications Panel */}
        <DashboardNotifications />
      </div>
    </div>
  );
};

export default DashboardLayout;
