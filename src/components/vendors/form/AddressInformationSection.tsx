
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { VendorFormValues } from "./vendorFormSchema";

interface AddressInformationSectionProps {
  control: Control<VendorFormValues>;
}

const AddressInformationSection: React.FC<AddressInformationSectionProps> = ({ control }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="address"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-muted-foreground">Street Address</FormLabel>
            <FormControl>
              <Input placeholder="Enter street address" className="bg-muted/30 border-border/60 focus-visible:ring-primary/30" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <FormField
          control={control}
          name="city"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-muted-foreground">City</FormLabel>
              <FormControl>
                <Input placeholder="Enter city" className="bg-muted/30 border-border/60 focus-visible:ring-primary/30" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="state"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-muted-foreground">State</FormLabel>
              <FormControl>
                <Input placeholder="Enter state" className="bg-muted/30 border-border/60 focus-visible:ring-primary/30" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={control}
          name="zip_code"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-muted-foreground">ZIP Code</FormLabel>
              <FormControl>
                <Input placeholder="Enter ZIP code" className="bg-muted/30 border-border/60 focus-visible:ring-primary/30" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};

export default AddressInformationSection;
