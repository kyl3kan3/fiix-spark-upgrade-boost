
import React from "react";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2 } from "lucide-react";
import { steps } from "./setupSteps";

interface SetupProgressProps {
  currentStep?: number;
  totalSteps?: number;
}

export const SetupProgress: React.FC<SetupProgressProps> = ({ 
  currentStep = 0, 
  totalSteps = steps.length 
}) => {
  const progressPercentage = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Setup Progress</h3>
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Step {currentStep + 1} of {totalSteps}
          </span>
        </div>
        <Progress value={progressPercentage} className="h-2" />
      </div>
      
      <div className="space-y-2">
        {steps.map((step, index) => (
          <div 
            key={step.id} 
            className={`flex items-center gap-3 p-2 rounded ${
              index === currentStep 
                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300' 
                : index < currentStep 
                  ? 'text-green-600 dark:text-green-400' 
                  : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {index < currentStep ? (
              <CheckCircle2 className="h-5 w-5" />
            ) : (
              <div className={`w-5 h-5 rounded-full border-2 ${
                index === currentStep 
                  ? 'border-blue-500 bg-blue-500' 
                  : 'border-gray-300 dark:border-gray-600'
              }`} />
            )}
            <span className="font-medium">{step.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
