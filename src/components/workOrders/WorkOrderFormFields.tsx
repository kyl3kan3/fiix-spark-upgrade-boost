
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormValues } from "./WorkOrderFormSchema";
import { BasicFields } from "./fields/BasicFields";
import { StatusPriorityFields } from "./fields/StatusPriorityFields";
import { DateAssetFields } from "./fields/DateAssetFields";
import { AssignmentField } from "./fields/AssignmentField";
import { useWorkOrderFormData } from "./hooks/useWorkOrderFormData";

type WorkOrderFormFieldsProps = {
  form: UseFormReturn<WorkOrderFormValues>;
};

export const WorkOrderFormFields = ({ form }: WorkOrderFormFieldsProps) => {
  // Fetch form data
  const { assets, technicians } = useWorkOrderFormData();

  return (
    <>
      <BasicFields form={form} />
      <StatusPriorityFields form={form} />
      <DateAssetFields form={form} assets={assets} />
      <AssignmentField form={form} technicians={technicians} />
    </>
  );
};
