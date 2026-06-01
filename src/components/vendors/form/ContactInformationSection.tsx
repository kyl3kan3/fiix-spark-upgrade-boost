
import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Control } from "react-hook-form";
import { VendorFormValues } from "./vendorFormSchema";

interface ContactInformationSectionProps {
  control: Control<VendorFormValues>;
}

const ContactInformationSection: React.FC<ContactInformationSectionProps> = ({ control }) => {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name="email"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-muted-foreground">Email</FormLabel>
            <FormControl>
              <Input type="email" placeholder="Enter email address" className="bg-muted/30 border-border/60 focus-visible:ring-primary/30" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="phone"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-muted-foreground">Phone</FormLabel>
            <FormControl>
              <Input placeholder="Enter phone number" className="bg-muted/30 border-border/60 focus-visible:ring-primary/30" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contact_person"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-muted-foreground">Contact Person</FormLabel>
            <FormControl>
              <Input placeholder="Enter contact person name" className="bg-muted/30 border-border/60 focus-visible:ring-primary/30" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="contact_title"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-muted-foreground">Contact Title</FormLabel>
            <FormControl>
              <Input placeholder="Enter contact person title" className="bg-muted/30 border-border/60 focus-visible:ring-primary/30" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={control}
        name="website"
        render={({ field }) => (
          <FormItem>
            <FormLabel className="text-sm font-semibold text-muted-foreground">Website</FormLabel>
            <FormControl>
              <Input placeholder="https://example.com" className="bg-muted/30 border-border/60 focus-visible:ring-primary/30" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};

export default ContactInformationSection;
