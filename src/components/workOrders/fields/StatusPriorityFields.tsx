
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
 <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
 <FormField
 control={form.control}
 name="priority"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm font-semibold text-muted-foreground">Priority Level</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger className="bg-muted/30 border-border/60 focus:ring-primary/30">
 <SelectValue placeholder="Select priority" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 <SelectItem value="low">Low — no rush</SelectItem>
 <SelectItem value="medium">Medium — this week</SelectItem>
 <SelectItem value="high">High — slowing us down</SelectItem>
 <SelectItem value="urgent">Urgent — broken or unsafe</SelectItem>
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
 <FormLabel className="text-sm font-semibold text-muted-foreground">Current Status</FormLabel>
 <Select onValueChange={field.onChange} defaultValue={field.value}>
 <FormControl>
 <SelectTrigger className="bg-muted/30 border-border/60 focus:ring-primary/30">
 <SelectValue placeholder="Select status" />
 </SelectTrigger>
 </FormControl>
 <SelectContent>
 <SelectItem value="pending">Pending — not started</SelectItem>
 <SelectItem value="in_progress">In Progress</SelectItem>
 <SelectItem value="completed">Completed</SelectItem>
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
