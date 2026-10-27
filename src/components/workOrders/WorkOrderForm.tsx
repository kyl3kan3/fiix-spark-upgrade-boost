
import React, { useEffect } from "react";
import { Form } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { useCompanyTimezone } from "@/hooks/useCompanyTimezone";
import { workOrderDueDateInputValue } from "@/lib/workOrderDueDate";
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
 const { data: companyTz = "UTC" } = useCompanyTimezone();
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
 due_date: "",
 asset_id: initialData?.asset_id || undefined,
 assigned_to: initialData?.assigned_to || undefined
 },
 });

 useEffect(() => {
 if (!initialData?.due_date) return;
 form.setValue(
   "due_date",
   workOrderDueDateInputValue(initialData.due_date, companyTz),
 );
 }, [initialData?.due_date, companyTz, form]);

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
