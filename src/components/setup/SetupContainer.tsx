import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import SetupHeader from "./SetupHeader";
import { SetupProgress } from "./SetupProgress";
import { SetupNavigation } from "./SetupNavigation";
import { useSetup } from "./SetupContext";
import { steps } from "./setupSteps";

// Define a common type for setup step components
export interface SetupStepComponentProps {
  data: Record<string, any>;
  onUpdate: (data: any) => void;
}

export const SetupContainer: React.FC = () => {
  const { currentStep, setCurrentStep, updateSetupData, setupData, isLoading } = useSetup();
  
  // Keep the tabs in sync with the current step
  useEffect(() => {
    console.log("Current step updated to:", currentStep, steps[currentStep]?.id);
  }, [currentStep]);
  
  const CurrentStepComponent = steps[currentStep].component;
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-5xl">
        <SetupHeader title="System Setup" subtitle="Loading your setup data..." />
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-4 w-1/4 mt-2" />
          </CardHeader>
          <CardContent className="space-y-4">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </CardContent>
          <CardFooter>
            <div className="flex justify-between w-full">
              <Skeleton className="h-10 w-24" />
              <Skeleton className="h-10 w-24" />
            </div>
          </CardFooter>
        </Card>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <SetupHeader title="MaintenEase Setup Wizard" subtitle="Configure your maintenance management system" />
      
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>{steps[currentStep].label}</CardTitle>
          <CardDescription>
            Step {currentStep + 1} of {steps.length}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <SetupProgress />
          
          {/* Main setup content */}
          <Tabs 
            value={steps[currentStep].id} 
            defaultValue={steps[0].id}
            onValueChange={(value) => {
              const newStepIndex = steps.findIndex(step => step.id === value);
              if (newStepIndex !== -1) {
                setCurrentStep(newStepIndex);
              }
            }}
          >
            <TabsList className="hidden">
              {steps.map((step) => (
                <TabsTrigger key={step.id} value={step.id}>
                  {step.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            <div className="mt-6">
              <CurrentStepComponent 
                data={setupData[steps[currentStep].id.replace(/-/g, '').replace('company-info', 'companyInfo') as keyof typeof setupData] || {}} 
                onUpdate={(data: any) => {
                  // Make sure we're using the correct camelCase for company-info
                  const sectionKey = steps[currentStep].id === 'company-info' 
                    ? 'companyInfo' 
                    : steps[currentStep].id.replace(/-/g, '') as keyof typeof setupData;
                  
                  updateSetupData(sectionKey, data);
                }} 
              />
            </div>
          </Tabs>
        </CardContent>
        <CardFooter>
          <SetupNavigation />
        </CardFooter>
      </Card>
    </div>
  );
};
