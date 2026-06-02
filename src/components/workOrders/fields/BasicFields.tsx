
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
 <div className="space-y-5">
 <FormField
 control={form.control}
 name="title"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm font-semibold text-muted-foreground">Work Order Title</FormLabel>
 <FormControl>
 <Input
 placeholder="e.g. HVAC Unit 4 Overheating"
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
 name="description"
 render={({ field }) => (
 <FormItem>
 <FormLabel className="text-sm font-semibold text-muted-foreground">Detailed Description</FormLabel>
 <FormControl>
 <Textarea
 placeholder="Describe the issue, symptoms, and any troubleshooting steps already taken…"
 className="min-h-[110px] bg-muted/30 border-border/60 focus-visible:ring-primary/30 resize-none"
 {...field}
 />
 </FormControl>
 <FormMessage />
 </FormItem>
 )}
 />
 </div>
 );
};
