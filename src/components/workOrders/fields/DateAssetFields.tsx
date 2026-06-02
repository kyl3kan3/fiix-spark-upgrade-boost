
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
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <FormField
 control={form.control}
 name="due_date"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm font-semibold text-muted-foreground">Due Date</FormLabel>
 <FormControl>
 <Input
 type="date"
 className="bg-muted/30 border-border/60 focus-visible:ring-primary/30"
 {...field}
 />
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
 <FormLabel className="text-sm font-semibold text-muted-foreground">Related Asset</FormLabel>
 <Select onValueChange={field.onChange} value={field.value || "none"}>
 <FormControl>
 <SelectTrigger className="bg-muted/30 border-border/60 focus:ring-primary/30">
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
