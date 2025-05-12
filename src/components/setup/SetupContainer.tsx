
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { SetupHeader } from "./SetupHeader";
import { SetupProgress } from "./SetupProgress";
import { SetupNavigation } from "./SetupNavigation";
import { useSetup } from "./SetupContext";
import { steps } from "./setupSteps";

export const SetupContainer: React.FC = () => {
  const { currentStep, updateSetupData, setupData } = useSetup();
  
  const CurrentStepComponent = steps[currentStep].component;
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <SetupHeader />
      
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
          <Tabs value={steps[currentStep].id}>
            <TabsList className="hidden">
              {steps.map((step) => (
                <TabsTrigger key={step.id} value={step.id}>
                  {step.label}
                </TabsTrigger>
              ))}
            </TabsList>
            
            {steps.map((step) => (
              <TabsContent key={step.id} value={step.id}>
                {currentStep === steps.findIndex(s => s.id === step.id) && (
                  <CurrentStepComponent 
                    data={setupData[step.id.replace(/-/g, '') as keyof typeof setupData]} 
                    onUpdate={(data: any) => updateSetupData(step.id.replace(/-/g, '') as keyof typeof setupData, data)} 
                  />
                )}
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
        <CardFooter>
          <SetupNavigation />
        </CardFooter>
      </Card>
    </div>
  );
};
