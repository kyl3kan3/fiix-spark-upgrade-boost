
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkOrderFormValues } from "../WorkOrderFormSchema";

type StatusPriorityFieldsProps = {
  form: UseFormReturn<WorkOrderFormValues>;
};

export const StatusPriorityFields = ({ form }: StatusPriorityFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="priority"
        render={({ field }) => (
          <FormItem>
            <FormLabel>How urgent is it?</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pick how urgent" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="low">Whenever — no rush</SelectItem>
                <SelectItem value="medium">Soon — this week</SelectItem>
                <SelectItem value="high">Important — this is slowing us down</SelectItem>
                <SelectItem value="urgent">Right away — it's broken or unsafe</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Where is it now?</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              defaultValue={field.value}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Pick a status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="pending">Not started yet</SelectItem>
                <SelectItem value="in_progress">Being worked on</SelectItem>
                <SelectItem value="completed">All done</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
