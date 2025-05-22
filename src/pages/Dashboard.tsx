
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2, Building2, Settings, LogOut } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, signOut, isLoading } = useAuth();
  const [userName, setUserName] = useState<string>("");
  const [companyName, setCompanyName] = useState<string>("");
  const [role, setRole] = useState<string>("");
  const [isLoadingData, setIsLoadingData] = useState<boolean>(true);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        const { data: profile, error } = await supabase
          .from("profiles")
          .select("first_name, last_name, role, company_id")
          .eq("id", user.id)
          .single();

        if (error) throw error;

        const fullName = [profile.first_name, profile.last_name]
          .filter(Boolean)
          .join(" ");
        
        setUserName(fullName || user.email || "User");
        setRole(profile.role || "User");

        if (profile.company_id) {
          const { data: company, error: companyError } = await supabase
            .from("companies")
            .select("name")
            .eq("id", profile.company_id)
            .single();

          if (!companyError && company) {
            setCompanyName(company.name);
          }
        }
      } catch (err) {
        console.error("Error fetching user data:", err);
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchUserData();
  }, [user]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/auth");
  };

  if (isLoading || isLoadingData) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white shadow rounded-lg p-6 mb-6 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold">Welcome, {userName}</h1>
            <p className="text-gray-600">
              {role} at {companyName || "Your Company"}
            </p>
          </div>
          <Button variant="outline" onClick={handleSignOut}>
            <LogOut className="h-4 w-4 mr-2" />
            Sign Out
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Building2 className="h-5 w-5 mr-2" />
                Company
              </CardTitle>
              <CardDescription>Manage your company settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/company-setup")}
              >
                Update Company Info
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/team-setup")}
              >
                Manage Team
              </Button>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Settings
              </CardTitle>
              <CardDescription>Manage account settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Button 
                variant="outline" 
                className="w-full"
                onClick={() => navigate("/profile")}
              >
                Account Settings
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
