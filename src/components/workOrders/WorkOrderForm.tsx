
import React from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { WorkOrderFormData } from "@/types/workOrders";
import { WorkOrderFormFields } from "./WorkOrderFormFields";
import { workOrderFormSchema, WorkOrderFormValues } from "./WorkOrderFormSchema";
import { useWorkOrderSubmit } from "./hooks/useWorkOrderSubmit";
import { FormActions } from "./fields/FormActions";

type WorkOrderFormProps = {
  initialData?: WorkOrderFormData;
  workOrderId?: string;
  onSuccess?: () => void;
};

const WorkOrderForm = ({ initialData, workOrderId, onSuccess }: WorkOrderFormProps) => {
  const { handleSubmit, isSubmitting, isEditing } = useWorkOrderSubmit({
    workOrderId,
    onSuccess
  });

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

  const onSubmit = (values: WorkOrderFormValues) => {
    handleSubmit(values);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 dark:text-gray-200">
        <WorkOrderFormFields form={form} />
        <FormActions isSubmitting={isSubmitting} isEditing={isEditing} />
      </form>
    </Form>
  );
};

export default WorkOrderForm;
