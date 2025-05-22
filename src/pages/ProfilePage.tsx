
import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfilePage } from "@/hooks/profile/useProfilePage";
import { ProfileLoading } from "@/components/profile/page/ProfileLoading";
import { ProfileError } from "@/components/profile/page/ProfileError";
import { ProfileTabs } from "@/components/profile/page/ProfileTabs";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProfilePage = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const [initialCheckDone, setInitialCheckDone] = useState(false);
  const {
    loading,
    error,
    activeTab,
    handleTabChange,
    handleRefresh,
    refreshKey,
    profileLoading,
    profileError
  } = useProfilePage();

  // Check if user is authenticated
  useEffect(() => {
    console.log("ProfilePage auth check - isAuthenticated:", isAuthenticated);
    
    if (isAuthenticated === false) {
      console.log("No active session found, redirecting to auth");
      toast.info("Please login to view your profile");
      navigate("/auth", { replace: true });
      return;
    }
    
    if (isAuthenticated === true && user) {
      console.log("User authenticated in ProfilePage:", user.id);
      setInitialCheckDone(true);
    }
    
    if (isAuthenticated !== null) {
      setInitialCheckDone(true);
    }
  }, [isAuthenticated, user, navigate]);
  
  // Show loading state while checking auth
  if (!initialCheckDone || loading) {
    return <ProfileLoading />;
  }

  // Show error state if there was a problem loading the profile
  if (error || profileError) {
    const errorMessage = error || profileError || "Unknown error loading profile";
    return <ProfileError error={errorMessage} onRefresh={handleRefresh} />;
  }

  // At this point we're authenticated and no errors
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
