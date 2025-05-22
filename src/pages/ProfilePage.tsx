
import React, { useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileLoading } from "@/components/profile/page/ProfileLoading";
import { ProfileError } from "@/components/profile/page/ProfileError";
import { ProfileTabs } from "@/components/profile/page/ProfileTabs";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
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
  const handleRefresh = () => {
    setRefreshKey(prev => prev + 1);
    setError(null);
    setIsLoading(true);
    toast.info("Refreshing profile data...");
    
    // Simulate loading and then finish
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  };

  if (authLoading) {
    return <ProfileLoading />;
  }

  if (!isAuthenticated) {
    navigate("/auth", { replace: true });
    return null;
  }

  // Show error state if there was a problem
  if (error) {
    return <ProfileError error={error} onRefresh={handleRefresh} />;
  }

  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-6">Profile & Settings</h1>
          {isLoading && (
            <div className="flex items-center text-sm text-amber-600">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading profile data...
            </div>
          )}
          {!isLoading && (
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          )}
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
