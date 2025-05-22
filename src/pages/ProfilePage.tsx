
import React, { useEffect } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Loader2, RefreshCw, AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useProfilePage } from "@/hooks/profile/useProfilePage";
import { ProfileLoading } from "@/components/profile/page/ProfileLoading";
import { ProfileError } from "@/components/profile/page/ProfileError";
import { ProfileTabs } from "@/components/profile/page/ProfileTabs";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

const ProfilePage = () => {
  const navigate = useNavigate();
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
    const checkAuth = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error || !data.session) {
          console.log("User not authenticated in ProfilePage, redirecting to auth page");
          navigate("/auth", { replace: true });
        } else {
          console.log("User authenticated in ProfilePage:", data.session.user.id);
        }
      } catch (err) {
        console.error("Error checking auth in ProfilePage:", err);
        toast.error("Authentication error. Please log in again.");
        navigate("/auth", { replace: true });
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  // Show loading state while checking auth
  if (loading) {
    return <ProfileLoading />;
  }

  // Show error state if there was a problem loading the profile
  if (error || profileError) {
    return <ProfileError error={error || profileError || "Unknown error"} onRefresh={handleRefresh} />;
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
