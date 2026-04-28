
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { WorkOrderFormValues } from "../WorkOrderFormSchema";

type BasicFieldsProps = {
  form: UseFormReturn<WorkOrderFormValues>;
};

export const BasicFields = ({ form }: BasicFieldsProps) => {
  return (
    <>
      <FormField
        control={form.control}
        name="title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What's the problem?</FormLabel>
            <FormControl>
              <Input placeholder="e.g. Leaky faucet in 2nd-floor bathroom" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tell us a bit more</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="When did it start? Anything else we should know?"
                className="min-h-[100px]"
                {...field} 
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
};
