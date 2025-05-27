
import React, { useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";
import { ProfileTabs } from "@/components/profile/page/ProfileTabs";

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading, user } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Extract the tab from the URL search params
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'settings' ? 'settings' : 'profile');

  // Update URL when tab changes without page reload
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    const newUrl = value === 'settings' 
      ? '/profile?tab=settings' 
      : '/profile';
      
    navigate(newUrl, { replace: true });
  };

  // Handle refreshing the profile data
  const handleRefresh = async () => {
    setRefreshKey(prev => prev + 1);
    toast.info("Profile data refreshed");
  };

  // Show loading while checking authentication
  if (authLoading) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Profile & Settings</h1>
          <div className="animate-pulse space-y-4">
            <div className="h-12 bg-gray-200 rounded"></div>
            <div className="h-64 bg-gray-200 rounded"></div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  // Redirect to auth if not authenticated
  if (!isAuthenticated || !user) {
    navigate("/auth", { replace: true });
    return null;
  }

  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-6">Profile & Settings</h1>
          <Button variant="ghost" size="sm" onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
        
        <ProfileTabs 
          activeTab={activeTab} 
          onTabChange={handleTabChange}
          refreshKey={refreshKey}
        />
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
