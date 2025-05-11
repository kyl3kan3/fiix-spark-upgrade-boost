
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const ProfilePage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        
        if (!session) {
          navigate("/auth");
          return;
        }
        
        // Get user data
        setUserProfile({
          id: session.user.id,
          email: session.user.email,
          created_at: new Date(session.user.created_at).toLocaleDateString()
        });
        
        setLoading(false);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile information");
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      navigate("/");
    } catch (error) {
      toast.error("Failed to sign out");
      console.error(error);
    }
  };

  if (loading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center h-full">
          <div className="animate-pulse">Loading profile information...</div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-6">
        <h1 className="text-2xl font-bold mb-6">User Profile</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-1">
            <Card>
              <CardHeader className="flex flex-col items-center">
                <Avatar className="h-24 w-24 mb-4">
                  <AvatarImage src="" />
                  <AvatarFallback className="text-lg bg-maintenease-100 text-maintenease-600">
                    {userProfile?.email?.charAt(0).toUpperCase() || "U"}
                  </AvatarFallback>
                </Avatar>
                <CardTitle>{userProfile?.email}</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div>
                  <p className="text-sm text-gray-500">User ID</p>
                  <p className="text-sm font-medium truncate">{userProfile?.id}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Member Since</p>
                  <p className="font-medium">{userProfile?.created_at}</p>
                </div>
                <Separator className="my-2" />
                <Button 
                  variant="destructive" 
                  onClick={handleSignOut}
                  className="w-full mt-2"
                >
                  Sign Out
                </Button>
              </CardContent>
            </Card>
          </div>
          
          <div className="md:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-2">
                  <h3 className="text-lg font-medium">Email Address</h3>
                  <p className="text-gray-500">{userProfile?.email}</p>
                </div>
                <Separator />
                <div className="grid gap-2">
                  <h3 className="text-lg font-medium">Password</h3>
                  <p className="text-gray-500">••••••••</p>
                  <Button variant="outline" className="w-fit">Change Password</Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default ProfilePage;
