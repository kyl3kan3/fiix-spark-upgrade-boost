
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, CheckCircle, Settings } from "lucide-react";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import CompanyInfoSetup from "@/components/setup/CompanyInfoSetup";
import UserRolesSetup from "@/components/setup/UserRolesSetup";
import AssetCategoriesSetup from "@/components/setup/AssetCategoriesSetup";
import MaintenanceScheduleSetup from "@/components/setup/MaintenanceScheduleSetup";
import NotificationSetup from "@/components/setup/NotificationSetup";
import IntegrationsSetup from "@/components/setup/IntegrationsSetup";
import DashboardCustomizationSetup from "@/components/setup/DashboardCustomizationSetup";
import SetupComplete from "@/components/setup/SetupComplete";

const steps = [
  { id: "company-info", label: "Company Info" },
  { id: "user-roles", label: "User Roles" },
  { id: "asset-categories", label: "Asset Categories" },
  { id: "maintenance-schedules", label: "Schedules" },
  { id: "notifications", label: "Notifications" },
  { id: "integrations", label: "Integrations" },
  { id: "dashboard", label: "Dashboard" },
  { id: "complete", label: "Complete" }
];

const SetupPage = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [setupComplete, setSetupComplete] = useState(false);
  const [setupData, setSetupData] = useState({
    companyInfo: {},
    userRoles: {},
    assetCategories: {},
    maintenanceSchedules: {},
    notifications: {},
    integrations: {},
    dashboardCustomization: {}
  });

  const updateSetupData = (section: string, data: any) => {
    setSetupData(prev => ({
      ...prev,
      [section]: data
    }));
  };

  const handleNext = async () => {
    if (currentStep < steps.length - 1) {
      // Save current step data to local storage for now
      localStorage.setItem('maintenease_setup', JSON.stringify(setupData));
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  };

  const handleSkip = () => {
    if (currentStep < steps.length - 1) {
      toast.info(`Skipped ${steps[currentStep].label} setup. You can configure this later.`);
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  };

  const handleComplete = async () => {
    try {
      // For now, we'll just use localStorage until we create a system_settings table
      localStorage.setItem('maintenease_setup', JSON.stringify(setupData));
      
      setSetupComplete(true);
      toast.success("Setup completed successfully!");
      
      // Redirect to dashboard after short delay
      setTimeout(() => {
        navigate("/dashboard");
      }, 2000);
    } catch (error) {
      console.error("Error saving setup data:", error);
      toast.error("Failed to save setup data. Please try again.");
    }
  };

  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <DashboardLayout>
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <Settings className="h-6 w-6 text-maintenease-600" />
            <h1 className="text-2xl font-bold">MaintenEase Setup Wizard</h1>
          </div>
          {currentStep > 0 && currentStep < steps.length - 1 && (
            <Button variant="ghost" onClick={() => navigate("/dashboard")}>
              Finish Later
            </Button>
          )}
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>{steps[currentStep].label}</CardTitle>
            <CardDescription>
              Step {currentStep + 1} of {steps.length}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressPercentage} className="mb-4" />
            
            <TabsList className="hidden">
              {steps.map((step) => (
                <TabsTrigger key={step.id} value={step.id}>
                  {step.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <Tabs defaultValue={steps[currentStep].id} className="mt-4">
              <TabsContent value="company-info">
                <CompanyInfoSetup 
                  data={setupData.companyInfo} 
                  onUpdate={(data) => updateSetupData('companyInfo', data)} 
                />
              </TabsContent>
              <TabsContent value="user-roles">
                <UserRolesSetup 
                  data={setupData.userRoles} 
                  onUpdate={(data) => updateSetupData('userRoles', data)} 
                />
              </TabsContent>
              <TabsContent value="asset-categories">
                <AssetCategoriesSetup 
                  data={setupData.assetCategories} 
                  onUpdate={(data) => updateSetupData('assetCategories', data)} 
                />
              </TabsContent>
              <TabsContent value="maintenance-schedules">
                <MaintenanceScheduleSetup 
                  data={setupData.maintenanceSchedules} 
                  onUpdate={(data) => updateSetupData('maintenanceSchedules', data)} 
                />
              </TabsContent>
              <TabsContent value="notifications">
                <NotificationSetup 
                  data={setupData.notifications} 
                  onUpdate={(data) => updateSetupData('notifications', data)} 
                />
              </TabsContent>
              <TabsContent value="integrations">
                <IntegrationsSetup 
                  data={setupData.integrations} 
                  onUpdate={(data) => updateSetupData('integrations', data)} 
                />
              </TabsContent>
              <TabsContent value="dashboard">
                <DashboardCustomizationSetup 
                  data={setupData.dashboardCustomization} 
                  onUpdate={(data) => updateSetupData('dashboardCustomization', data)} 
                />
              </TabsContent>
              <TabsContent value="complete">
                <SetupComplete />
              </TabsContent>
            </Tabs>
          </CardContent>
          <CardFooter className="flex justify-between border-t pt-6">
            <Button
              variant="outline"
              onClick={handlePrevious}
              disabled={currentStep === 0}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            
            <div className="flex gap-2">
              {currentStep < steps.length - 2 && (
                <Button variant="ghost" onClick={handleSkip}>
                  Skip for now
                </Button>
              )}
              
              {currentStep === steps.length - 1 ? (
                <Button 
                  onClick={handleComplete}
                  disabled={setupComplete}
                >
                  <CheckCircle className="mr-2 h-4 w-4" /> 
                  Complete Setup
                </Button>
              ) : (
                <Button onClick={handleNext}>
                  Next <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              )}
            </div>
          </CardFooter>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default SetupPage;
