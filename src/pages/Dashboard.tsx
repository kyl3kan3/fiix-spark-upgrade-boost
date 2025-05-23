
import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Loader2, 
  Building2, 
  Users, 
  FileText, 
  CheckSquare, 
  Calendar, 
  TrendingUp, 
  Clock 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import DashboardQuickActions from "@/components/dashboard/DashboardQuickActions";

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
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-maintenease-50 to-blue-50 dark:from-gray-900 dark:to-gray-800">
        <div className="text-center glass-morphism dark:glass-morphism-dark p-10 rounded-xl">
          <Loader2 className="h-12 w-12 animate-spin text-primary mx-auto" />
          <p className="mt-4 text-lg font-medium">Loading your dashboard...</p>
          <p className="text-muted-foreground text-sm mt-2">Please wait while we prepare everything for you</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="container mx-auto p-6">
        <div className="mb-8 bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-100 dark:border-gray-700 animate-entry">
          <h1 className="text-3xl font-bold mb-2 text-gray-800 dark:text-white">
            Welcome, <span className="text-maintenease-500">{userName}</span>
          </h1>
          <p className="text-gray-600 dark:text-gray-300 flex items-center">
            <span className="bg-maintenease-100 dark:bg-maintenease-900 text-maintenease-700 dark:text-maintenease-300 px-3 py-1 rounded-full text-sm font-medium mr-2">
              {role}
            </span> 
            at {companyName || "Your Company"}
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover-scale animate-entry">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-blue-500" />
                Work Orders
              </CardTitle>
              <CardDescription>10 pending</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="bg-blue-100 dark:bg-blue-900/30 p-3 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/work-orders")}
                  className="font-medium border-blue-200 hover:border-blue-300 hover:bg-blue-50 dark:border-blue-800 dark:hover:border-blue-700 dark:hover:bg-blue-900/20"
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover-scale animate-entry" style={{ animationDelay: "50ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <CheckSquare className="h-5 w-5 text-green-500" />
                Inspections
              </CardTitle>
              <CardDescription>5 scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="bg-green-100 dark:bg-green-900/30 p-3 rounded-full">
                  <CheckSquare className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/inspections")}
                  className="font-medium border-green-200 hover:border-green-300 hover:bg-green-50 dark:border-green-800 dark:hover:border-green-700 dark:hover:bg-green-900/20"
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover-scale animate-entry" style={{ animationDelay: "100ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-500" />
                Team
              </CardTitle>
              <CardDescription>Manage members</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="bg-purple-100 dark:bg-purple-900/30 p-3 rounded-full">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/team")}
                  className="font-medium border-purple-200 hover:border-purple-300 hover:bg-purple-50 dark:border-purple-800 dark:hover:border-purple-700 dark:hover:bg-purple-900/20"
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm hover:shadow-md transition-all hover-scale animate-entry" style={{ animationDelay: "150ms" }}>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <Calendar className="h-5 w-5 text-amber-500" />
                Calendar
              </CardTitle>
              <CardDescription>3 events today</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-between items-center">
                <div className="bg-amber-100 dark:bg-amber-900/30 p-3 rounded-full">
                  <Calendar className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => navigate("/calendar")}
                  className="font-medium border-amber-200 hover:border-amber-300 hover:bg-amber-50 dark:border-amber-800 dark:hover:border-amber-700 dark:hover:bg-amber-900/20"
                >
                  View
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="mb-8">
          <DashboardQuickActions />
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2 bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm animate-entry" style={{ animationDelay: "200ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-maintenease-500" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="space-y-4">
                {/* Activity items would go here */}
                <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="bg-blue-100 dark:bg-blue-900/30 p-2 rounded-full">
                    <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">New work order created</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Today, 10:30 AM</p>
                  </div>
                </div>
                <div className="flex items-start gap-4 p-4 rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <div className="bg-green-100 dark:bg-green-900/30 p-2 rounded-full">
                    <CheckSquare className="h-4 w-4 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-sm font-medium">Inspection completed</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">Yesterday, 3:45 PM</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 shadow-sm animate-entry" style={{ animationDelay: "250ms" }}>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-maintenease-500" />
                At a Glance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm font-medium">Pending Tasks</span>
                  <span className="text-sm font-bold text-maintenease-600 dark:text-maintenease-400">8</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-maintenease-500 h-2.5 rounded-full" style={{ width: '45%' }}></div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm font-medium">Team Availability</span>
                  <span className="text-sm font-bold text-maintenease-600 dark:text-maintenease-400">75%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-blue-500 h-2.5 rounded-full" style={{ width: '75%' }}></div>
                </div>
                
                <div className="flex justify-between items-center mt-4">
                  <span className="text-sm font-medium">Asset Health</span>
                  <span className="text-sm font-bold text-maintenease-600 dark:text-maintenease-400">92%</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5">
                  <div className="bg-green-500 h-2.5 rounded-full" style={{ width: '92%' }}></div>
                </div>
              </div>
              
              <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                <Button 
                  variant="outline" 
                  className="w-full"
                  onClick={() => navigate("/reports")}
                >
                  <FileText className="mr-2 h-4 w-4" />
                  View Full Reports
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Dashboard;
