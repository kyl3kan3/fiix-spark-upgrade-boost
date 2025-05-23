
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Building2, Users, FileText, CheckSquare, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Dashboard: React.FC = () => {
  const navigate = useNavigate();
  const { user, isLoading } = useAuth();
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
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-2xl font-bold mb-2">Welcome, {userName}</h1>
          <p className="text-gray-600">
            {role} at {companyName || "Your Company"}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Work Orders</CardTitle>
              <CardDescription>10 pending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="bg-blue-100 p-2 rounded-full">
                  <FileText className="h-5 w-5 text-blue-600" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/work-orders")}
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Inspections</CardTitle>
              <CardDescription>5 scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="bg-green-100 p-2 rounded-full">
                  <CheckSquare className="h-5 w-5 text-green-600" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/inspections")}
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Team</CardTitle>
              <CardDescription>Manage members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="bg-purple-100 p-2 rounded-full">
                  <Users className="h-5 w-5 text-purple-600" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/team")}
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Calendar</CardTitle>
              <CardDescription>3 events today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="bg-amber-100 p-2 rounded-full">
                  <Calendar className="h-5 w-5 text-amber-600" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/calendar")}
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-gray-500">No recent activity to display</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/work-orders/new")}>
                <FileText className="mr-2 h-4 w-4" />
                Create Work Order
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/setup")}>
                <Building2 className="mr-2 h-4 w-4" />
                Update Company Info
              </Button>
              <Button variant="outline" className="w-full justify-start" onClick={() => navigate("/team-setup")}>
                <Users className="mr-2 h-4 w-4" />
                Invite Team Member
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
