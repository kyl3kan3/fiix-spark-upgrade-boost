
import React from "react";
import { Progress } from "@/components/ui/progress";
import { useSetup } from "./SetupContext";
import { steps } from "./setupSteps";

export const SetupProgress: React.FC = () => {
  const { currentStep } = useSetup();
  const progressPercentage = ((currentStep + 1) / steps.length) * 100;

  return (
    <>
      <Progress value={progressPercentage} className="mb-4" />
    </>
  );
};
