
import React from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import BasicInfoFields from "./BasicInfoFields";
import AddressFields from "./AddressFields";
import ContactInfoFields from "./ContactInfoFields";
import { CompanyInfoFormValues } from "./companyInfoSchema";
import { UseFormReturn } from "react-hook-form";

interface CompanyFormProps {
  form: UseFormReturn<CompanyInfoFormValues>;
  isSubmitting: boolean;
  companyId: string | null;
  onSubmit: (values: CompanyInfoFormValues) => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ 
  form, 
  isSubmitting, 
  companyId, 
  onSubmit 
}) => {
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <BasicInfoFields form={form} />
        <AddressFields form={form} />
        <ContactInfoFields form={form} />
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting 
            ? "Saving..." 
            : companyId 
              ? "Update Company Information" 
              : "Create Company"}
        </Button>
      </form>
    </Form>
  );
};

export default CompanyForm;
