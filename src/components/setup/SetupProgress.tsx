
import React from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { steps } from "./setupSteps";

interface SetupProgressProps {
  currentStep?: number;
  totalSteps?: number;
  onStepClick?: (step: number) => void;
}

export const SetupProgress: React.FC<SetupProgressProps> = ({
  currentStep = 0,
  totalSteps = steps.length,
  onStepClick,
}) => {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="bg-card border border-border rounded-lg p-6 shadow-sm">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-foreground uppercase tracking-wide">
            Setup Progress
          </h3>
          <span className="text-xs text-muted-foreground">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>

      <div className="space-y-1">
        {steps.map((step, index) => (
          <button
            type="button"
            key={step.id}
            onClick={() => onStepClick && index <= currentStep && onStepClick(index)}
            disabled={!onStepClick || index > currentStep}
            className={`w-full text-left flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm ${
              index === currentStep
                ? "bg-primary/10 text-primary font-semibold"
                : index < currentStep
                ? "text-success hover:bg-muted/50 cursor-pointer"
                : "text-muted-foreground cursor-default"
            }`}
          >
            {index < currentStep ? (
              <CheckCircle2 className="h-4 w-4 shrink-0" />
            ) : (
              <div
                className={`w-4 h-4 rounded-full border-2 shrink-0 ${
                  index === currentStep
                    ? "border-primary bg-primary"
                    : "border-border"
                }`}
              />
            )}
            <span className="font-medium">{step.label}</span>
          </button>
        ))}
      </div>
    </div>
  );
};
