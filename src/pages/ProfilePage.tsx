
import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import SetAdminUser from "@/components/admin/SetAdminUser";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { InfoIcon, LogOut, AlertTriangle } from "lucide-react";
import ProfileInformation from "@/components/profile/ProfileInformation";
import CompanyInformation from "@/components/profile/CompanyInformation";
import DeleteAccountButton from "@/components/profile/DeleteAccountButton";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import SettingsTab from "@/components/dashboard/tabs/SettingsTab";
import { useUserProfile } from "@/hooks/team/useUserProfile";
import { toast } from "sonner";

const ProfilePage = () => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const { profileData, error: profileError } = useUserProfile(['role', 'company_id']);
  
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

  useEffect(() => {
    const fetchUserEmail = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        setUserEmail(user?.email ?? null);
        if (!user) {
          setError("You must be logged in to view your profile");
          // Don't redirect here to avoid potential loops
        }
      } catch (err) {
        console.error("Error fetching user:", err);
        setError("Failed to load user information");
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserEmail();
  }, []);

  // Effect to update active tab when URL changes
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromUrl = params.get('tab');
    setActiveTab(tabFromUrl === 'settings' ? 'settings' : 'profile');
  }, [location.search]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("You have been logged out successfully");
      navigate("/auth");
    } catch (error) {
      console.error("Error signing out:", error);
      toast.error("Failed to sign out. Please try again.");
    }
  };

  if (loading) {
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

  if (error) {
    return (
      <DashboardLayout>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">Profile & Settings</h1>
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
          <Button onClick={() => navigate("/auth")}>Go to Login</Button>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <BackToDashboard />
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Profile & Settings</h1>
        
        {/* Show error if there's a company requirement issue */}
        {profileError && profileError.includes("company") && (
          <Alert className="mb-6 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
            <AlertDescription className="text-red-700">
              {profileError}. Please set up your company information to continue using the application.
            </AlertDescription>
          </Alert>
        )}
        
        <Tabs value={activeTab} onValueChange={handleTabChange} className="mt-4">
          <TabsList className="mb-6 bg-white/70 backdrop-blur-xl shadow-sm border">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="settings">Settings</TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile">
            <div className="space-y-8">
              {/* Profile Information */}
              <ProfileInformation />
              {/* Company Information */}
              <CompanyInformation />
              {/* Administrator Access */}
              <Alert className="mb-4 bg-blue-50 border-blue-200">
                <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
                <AlertDescription className="text-blue-700">
                  Administrator access lets you manage all users and system settings
                </AlertDescription>
              </Alert>
              {/* Use currently logged-in user for admin section */}
              <SetAdminUser email={userEmail ?? undefined} />
              <DeleteAccountButton />
              {/* Sign out button */}
              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  className="flex items-center gap-2"
                  onClick={handleSignOut}
                >
                  <LogOut className="h-4 w-4" /> Sign out
                </Button>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="settings">
            <SettingsTab />
          </TabsContent>
        </Tabs>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
