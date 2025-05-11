
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkOrderFormValues } from "../WorkOrderFormSchema";
import { Profile } from "@/types/workOrders";

type AssignmentFieldProps = {
  form: UseFormReturn<WorkOrderFormValues>;
  technicians?: Profile[];
};

export const AssignmentField = ({ form, technicians = [] }: AssignmentFieldProps) => {
  return (
    <FormField
      control={form.control}
      name="assigned_to"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Assign To</FormLabel>
          <Select 
            onValueChange={field.onChange} 
            value={field.value || "none"}
          >
            <FormControl>
              <SelectTrigger>
                <SelectValue placeholder="Assign to technician (optional)" />
              </SelectTrigger>
            </FormControl>
            <SelectContent>
              <SelectItem value="none">Unassigned</SelectItem>
              {technicians?.map((tech) => (
                <SelectItem key={tech.id} value={tech.id}>
                  {tech.first_name} {tech.last_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};
