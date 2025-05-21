
import React from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfilePage } from "@/hooks/profile/useProfilePage";
import { ProfileLoading } from "@/components/profile/page/ProfileLoading";
import { ProfileError } from "@/components/profile/page/ProfileError";
import { ProfileTabs } from "@/components/profile/page/ProfileTabs";

const ProfilePage = () => {
  const {
    loading,
    error,
    activeTab,
    handleTabChange,
    handleRefresh,
    refreshKey,
    profileLoading
  } = useProfilePage();

  if (loading) {
    return <ProfileLoading />;
  }

  if (error) {
    return <ProfileError error={error} onRefresh={handleRefresh} />;
  }

  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold mb-6">Profile & Settings</h1>
          {profileLoading && (
            <div className="flex items-center text-sm text-amber-600">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Loading profile data...
            </div>
          )}
          {!profileLoading && (
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
