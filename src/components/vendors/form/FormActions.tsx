
import React from "react";
import { Button } from "@/components/ui/button";

interface FormActionsProps {
  isLoading: boolean;
}

const FormActions: React.FC<FormActionsProps> = ({ isLoading }) => {
  return (
    <div className="flex justify-end space-x-4 pt-6 border-t">
      <Button type="button" variant="outline" onClick={() => window.history.back()}>
        Cancel
      </Button>
      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Vendor"}
      </Button>
    </div>
  );
};

export default FormActions;
