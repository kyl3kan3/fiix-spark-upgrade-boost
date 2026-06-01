
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
 <div className="flex justify-end gap-3 pt-2">
 <Button
 type="button"
 variant="outline"
 onClick={() => navigate("/work-orders")}
 disabled={isSubmitting}
 className="uppercase tracking-wide font-semibold text-xs px-6"
 >
 Cancel
 </Button>
 <Button
 type="submit"
 disabled={isSubmitting}
 className="uppercase tracking-wide font-semibold text-xs px-8 gap-2 shadow-sm"
 >
 {isEditing ? "Update Work Order" : "Create Work Order"}
 </Button>
 </div>
 );
};
