
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Control } from "react-hook-form";
import { VendorFormValues } from "./vendorFormSchema";

interface BasicInformationSectionProps {
  control: Control<VendorFormValues>;
}

const BasicInformationSection: React.FC<BasicInformationSectionProps> = ({ control }) => {
  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
        Basic Information
      </h3>
      
      <FormField
        control={control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vendor Name *</FormLabel>
            <FormControl>
              <Input placeholder="Enter vendor name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="vendor_type"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Vendor Type</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select vendor type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="service">Service</SelectItem>
                <SelectItem value="supplier">Supplier</SelectItem>
                <SelectItem value="contractor">Contractor</SelectItem>
                <SelectItem value="consultant">Consultant</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="status"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Status</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="rating"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Rating (1-5)</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min="1" 
                max="5" 
                placeholder="Enter rating"
                value={field.value || ""}
                onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : null)}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default BasicInformationSection;
