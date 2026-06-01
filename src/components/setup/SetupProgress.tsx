
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
 <div className="bg-card rounded-lg p-6 shadow-sm border border-border">
 <div className="mb-4">
 <div className="flex items-center justify-between mb-2">
 <h3 className="text-lg font-semibold text-foreground">Setup Progress</h3>
 <span className="text-sm text-muted-foreground">
 Step {currentStep + 1} of {totalSteps}
 </span>
 </div>
 <Progress value={progressPercentage} className="h-2" />
 </div>
 
 <div className="space-y-2">
 {steps.map((step, index) => (
 <button
 type="button"
 key={step.id}
 onClick={() => onStepClick && index <= currentStep && onStepClick(index)}
 disabled={!onStepClick || index > currentStep}
 className={`w-full text-left flex items-center gap-3 p-2 rounded transition-colors ${ index === currentStep ? 'bg-primary/10 dark:bg-primary/20 text-primary dark:text-primary' : index < currentStep ? 'text-success dark:text-success hover:bg-muted/50' : 'text-muted-foreground cursor-default' }`}
 >
 {index < currentStep ? (
 <CheckCircle2 className="h-5 w-5" />
 ) : (
 <div className={`w-5 h-5 rounded-full border-2 ${ index === currentStep ? 'border-primary bg-primary' : 'border-border ' }`} />
 )}
 <span className="font-medium">{step.label}</span>
 </button>
 ))}
 </div>
 </div>
 );
};
