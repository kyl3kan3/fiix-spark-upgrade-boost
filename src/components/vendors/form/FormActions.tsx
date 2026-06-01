
import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isLoading: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ isLoading }) => {
  return (
    <div className="flex justify-end gap-3 pt-2">
      <Button
        type="button"
        variant="ghost"
        onClick={() => window.history.back()}
        disabled={isLoading}
        className="uppercase tracking-wide font-semibold text-xs px-6"
      >
        Cancel
      </Button>
      <Button
        type="submit"
        disabled={isLoading}
        className="uppercase tracking-wide font-semibold text-xs px-8 gap-2 shadow-sm"
      >
        {isLoading ? "Saving…" : "Save Vendor"}
      </Button>
    </div>
  );
};

export default FormActions;
