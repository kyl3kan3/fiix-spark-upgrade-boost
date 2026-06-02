
import React from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Info } from "lucide-react";
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
 <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
 {/* The form sections are rendered inside the form card wrapper */}
 <div className="bg-surface-container-lowest rounded-xl border border-border/60 shadow-sm p-6 space-y-6">
 <div className="flex items-center gap-3 mb-2">
 <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
 <Info className="h-4 w-4 text-primary" />
 </div>
 <h2 className="font-headline text-lg font-semibold text-foreground">General Information</h2>
 </div>
 <WorkOrderFormFields form={form} />
 </div>
 <FormActions isSubmitting={isSubmitting} isEditing={isEditing} />
 </form>
 </Form>
 );
};

export default WorkOrderForm;
