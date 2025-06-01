
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
  onSubmit: () => void;
}

const CompanyForm: React.FC<CompanyFormProps> = ({ 
  form, 
  isSubmitting, 
  companyId, 
  onSubmit 
}) => {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700">
      <Form {...form}>
        <form onSubmit={onSubmit} className="space-y-4">
          <BasicInfoFields form={form} />
          <AddressFields form={form} />
          <ContactInfoFields form={form} />
          <Button 
            type="submit" 
            disabled={isSubmitting}
            className="bg-primary hover:bg-primary/90 text-primary-foreground dark:bg-primary dark:hover:bg-primary/90"
          >
            {isSubmitting 
              ? "Saving..." 
              : companyId 
                ? "Update Company Information" 
                : "Create Company"}
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default CompanyForm;
