
import React from "react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate } from "react-router-dom";
import { WorkOrderFormData } from "@/types/workOrders";
import { supabase } from "@/integrations/supabase/client";
import { WorkOrderFormFields } from "./WorkOrderFormFields";
import { workOrderFormSchema, WorkOrderFormValues } from "./WorkOrderFormSchema";
import { createWorkOrder, updateWorkOrder } from "@/services/workOrderService";

type WorkOrderFormProps = {
  initialData?: WorkOrderFormData;
  workOrderId?: string;
  onSuccess?: () => void;
};

const WorkOrderForm = ({ initialData, workOrderId, onSuccess }: WorkOrderFormProps) => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const isEditing = !!workOrderId;

  const form = useForm<WorkOrderFormValues>({
    resolver: zodResolver(workOrderFormSchema),
    defaultValues: {
      title: initialData?.title || "",
      description: initialData?.description || "",
      priority: initialData?.priority || "medium",
      status: initialData?.status || "pending",
      due_date: initialData?.due_date ? new Date(initialData.due_date).toISOString().split("T")[0] : "",
      asset_id: initialData?.asset_id || undefined,
      assigned_to: initialData?.assigned_to || undefined
    },
  });

  const onSubmit = async (values: WorkOrderFormValues) => {
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
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <WorkOrderFormFields form={form} />
        
        <div className="flex justify-end space-x-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={() => navigate("/work-orders")}
          >
            Cancel
          </Button>
          <Button type="submit">
            {isEditing ? "Update Work Order" : "Create Work Order"}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WorkOrderForm;
