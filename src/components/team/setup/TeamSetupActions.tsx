
import React from "react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";

interface TeamSetupActionsProps {
  isSubmitting: boolean;
}

export const TeamSetupActions: React.FC<TeamSetupActionsProps> = ({ isSubmitting }) => {
  const navigate = useNavigate();

  const handleSkip = () => {
    toast.info("You can invite team members later from the Team page");
    navigate("/dashboard");
  };

  return (
    <div className="mt-6 text-center">
      <Button
        variant="outline"
        onClick={handleSkip}
        disabled={isSubmitting}
      >
        Skip for now
      </Button>
    </div>
  );
};
