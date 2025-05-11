
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

type FormActionsProps = {
  isSubmitting: boolean;
  isEditing: boolean;
};

export const FormActions = ({ isSubmitting, isEditing }: FormActionsProps) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex justify-end space-x-2">
      <Button 
        type="button" 
        variant="outline" 
        onClick={() => navigate("/work-orders")}
        disabled={isSubmitting}
      >
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isEditing ? "Update Work Order" : "Create Work Order"}
      </Button>
    </div>
  );
};
