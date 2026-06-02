
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Control } from "react-hook-form";
import { VendorFormValues } from "./vendorFormSchema";

interface DescriptionSectionProps {
  control: Control<VendorFormValues>;
}

const DescriptionSection: React.FC<DescriptionSectionProps> = ({ control }) => {
  return (
    <FormField
      control={control}
      name="description"
      render={({ field }) => (
        <FormItem>
          <FormLabel className="text-sm font-semibold text-muted-foreground">Description</FormLabel>
          <FormControl>
            <Textarea
              placeholder="Enter vendor description or notes"
              className="min-h-[100px] bg-muted/30 border-border/60 focus-visible:ring-primary/30 resize-none"
              {...field}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DescriptionSection;
