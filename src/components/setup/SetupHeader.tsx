
import React from "react";
import { Button } from "@/components/ui/button";
import { Settings } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useSetup } from "./SetupContext";
import { steps } from "./setupSteps";

export const SetupHeader: React.FC = () => {
  const navigate = useNavigate();
  const { currentStep } = useSetup();

  return (
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
  );
};
