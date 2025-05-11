
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { WorkOrderFormValues } from "../WorkOrderFormSchema";
import { supabase } from "@/integrations/supabase/client";
import { createWorkOrder, updateWorkOrder } from "@/services/workOrderService";

type UseWorkOrderSubmitProps = {
  workOrderId?: string;
  onSuccess?: () => void;
};

export const useWorkOrderSubmit = ({ workOrderId, onSuccess }: UseWorkOrderSubmitProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!workOrderId;

  const handleSubmit = async (values: WorkOrderFormValues) => {
    setIsSubmitting(true);
    try {
      const user = (await supabase.auth.getUser()).data.user;
      
      if (!user) {
        toast({
          title: "Authentication Error",
          description: "You must be logged in to create work orders",
          variant: "destructive"
        });
        return;
      }

      let response;
      
      if (isEditing && workOrderId) {
        response = await updateWorkOrder(workOrderId, values);
      } else {
        response = await createWorkOrder(user.id, values);
      }

      if (response.error) {
        throw response.error;
      }

      toast({
        title: isEditing ? "Work Order Updated" : "Work Order Created",
        description: isEditing 
          ? "The work order has been updated successfully." 
          : "A new work order has been created successfully."
      });
      
      if (onSuccess) {
        onSuccess();
      } else {
        navigate("/work-orders");
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    handleSubmit,
    isSubmitting,
    isEditing
  };
};
