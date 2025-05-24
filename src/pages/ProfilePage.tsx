
import React, { useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { useSimpleProfile } from "@/hooks/profile/useSimpleProfile";
import { ProfileTabs } from "@/components/profile/page/ProfileTabs";

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const { profileData, isLoading: profileLoading, error, refreshProfile } = useSimpleProfile();
  const [refreshKey, setRefreshKey] = useState(0);
  
  // Extract the tab from the URL search params
  const searchParams = new URLSearchParams(location.search);
  const tabParam = searchParams.get('tab');
  const [activeTab, setActiveTab] = useState(tabParam === 'settings' ? 'settings' : 'profile');

  // Update URL when tab changes without page reload
  const handleTabChange = (value: string) => {
    setActiveTab(value);
    
    // Update the URL without full page reload
    const newUrl = value === 'settings' 
      ? '/profile?tab=settings' 
      : '/profile';
      
    // Use navigate with replace option to avoid adding to history
    navigate(newUrl, { replace: true });
  };

  // Handle refreshing the profile data
  const handleRefresh = async () => {
    setRefreshKey(prev => prev + 1);
    await refreshProfile();
    toast.info("Profile data refreshed");
  };

  if (authLoading || profileLoading) {
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

  if (!isAuthenticated) {
    navigate("/auth", { replace: true });
    return null;
  }

  // Show error state if there was a problem
  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Profile & Settings</h1>
          <div className="bg-red-50 border border-red-200 rounded p-4 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
          <Button onClick={handleRefresh}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </div>
      </DashboardLayout>
    );
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
