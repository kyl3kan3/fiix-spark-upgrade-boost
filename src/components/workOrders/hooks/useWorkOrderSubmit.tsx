
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { WorkOrderFormValues } from "../WorkOrderFormSchema";
import { supabase } from "@/integrations/supabase/client";
import { createWorkOrder, updateWorkOrder } from "@/services/workOrderService";
import {
  notifyWorkOrderAssigned,
  notifyWorkOrderCompleted,
} from "@/services/notifications/workOrderNotifier";

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
      let previousAssignee: string | null = null;
      let previousStatus: string | null = null;
      let creatorId: string | null = null;

      if (isEditing && workOrderId) {
        const { data: existing } = await supabase
          .from("work_orders")
          .select("assigned_to, status, created_by")
          .eq("id", workOrderId)
          .maybeSingle();
        previousAssignee = existing?.assigned_to ?? null;
        previousStatus = existing?.status ?? null;
        creatorId = existing?.created_by ?? null;
        response = await updateWorkOrder(workOrderId, values);
      } else {
        response = await createWorkOrder(user.id, values);
        creatorId = user.id;
      }

      if (response.error) {
        throw response.error;
      }

      const saved = Array.isArray(response.data) ? response.data[0] : null;
      const savedId: string | undefined = saved?.id ?? workOrderId;

      // Notify newly assigned user
      if (savedId && values.assigned_to && values.assigned_to !== previousAssignee) {
        void notifyWorkOrderAssigned({
          workOrderId: savedId,
          title: values.title,
          assigneeId: values.assigned_to,
          actorId: user.id,
        });
      }

      // Notify creator when status transitions to completed
      if (
        savedId &&
        values.status === "completed" &&
        previousStatus !== "completed" &&
        creatorId
      ) {
        void notifyWorkOrderCompleted({
          workOrderId: savedId,
          title: values.title,
          creatorId,
          actorId: user.id,
        });
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
