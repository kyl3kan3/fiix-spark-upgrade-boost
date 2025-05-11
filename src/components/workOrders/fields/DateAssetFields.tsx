
import React from "react";
import { UseFormReturn } from "react-hook-form";
import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { WorkOrderFormValues } from "../WorkOrderFormSchema";
import { Asset } from "@/types/workOrders";

type DateAssetFieldsProps = {
  form: UseFormReturn<WorkOrderFormValues>;
  assets?: Asset[];
};

export const DateAssetFields = ({ form, assets = [] }: DateAssetFieldsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <FormField
        control={form.control}
        name="due_date"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Due Date</FormLabel>
            <FormControl>
              <Input type="date" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      
      <FormField
        control={form.control}
        name="asset_id"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Asset</FormLabel>
            <Select 
              onValueChange={field.onChange} 
              value={field.value || "none"}
            >
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select asset (optional)" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="none">No Asset</SelectItem>
                {assets?.map((asset) => (
                  <SelectItem key={asset.id} value={asset.id}>
                    {asset.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};
