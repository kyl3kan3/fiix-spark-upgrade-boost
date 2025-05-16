
import React, { useState, useEffect } from "react";
import { Form } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Building2 } from "lucide-react";
import { toast } from "sonner";

import CompanyLogoUploader from "./company/CompanyLogoUploader";
import BasicInfoFields from "./company/BasicInfoFields";
import AddressFields from "./company/AddressFields";
import ContactInfoFields from "./company/ContactInfoFields";
import { companyInfoSchema, CompanyInfoFormValues } from "./company/companyInfoSchema";

import { supabase } from "@/integrations/supabase/client";
import { createCompany, updateCompany, fetchUserCompany, mapCompanyToCompanyInfo } from "@/services/companyService";

interface CompanyInfoSetupProps {
  data: any;
  onUpdate: (data: any) => void;
}

const CompanyInfoSetup: React.FC<CompanyInfoSetupProps> = ({ data, onUpdate }) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const form = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyName: data?.companyName || "",
      industry: data?.industry || "",
      address: data?.address || "",
      city: data?.city || "",
      state: data?.state || "",
      zipCode: data?.zipCode || "",
      phone: data?.phone || "",
      email: data?.email || "",
      website: data?.website || "",
    },
  });

  // Check if we have company data from profile edit
  useEffect(() => {
    const editData = sessionStorage.getItem('edit_company_info');
    if (editData) {
      try {
        const parsedEditData = JSON.parse(editData);
        // Use this data to initialize form if available
        if (parsedEditData && Object.keys(parsedEditData).length > 0) {
          form.reset(parsedEditData);
          
          if (parsedEditData.logo) {
            setLogoPreview(parsedEditData.logo);
          }
        }
        // Clear session storage after use
        sessionStorage.removeItem('edit_company_info');
      } catch (e) {
        console.error("Error parsing edit company data:", e);
      }
    }
  }, []);
  
  // Load existing company data
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const company = await fetchUserCompany();
        if (company) {
          setCompanyId(company.id);
          const companyInfo = mapCompanyToCompanyInfo(company);
          form.reset(companyInfo);
          if (company.logo) {
            setLogoPreview(company.logo);
          }
        }
      } catch (error) {
        console.error("Error loading company data:", error);
      }
    };
    
    loadCompanyData();
  }, []);

  // Initialize logo preview from existing data
  useEffect(() => {
    if (data?.logo) {
      setLogoPreview(data.logo);
    }
  }, [data]);

  const handleLogoChange = (logoData: string | null) => {
    setLogoPreview(logoData);
    onUpdate({ ...form.getValues(), logo: logoData });
  };

  // Auto-save when form values change
  useEffect(() => {
    const subscription = form.watch((values) => {
      onUpdate({ ...values, logo: logoPreview });
    });
    
    return () => subscription.unsubscribe();
  }, [form, logoPreview, onUpdate]);

  const onSubmit = async (values: CompanyInfoFormValues) => {
    const formData = { ...values, logo: logoPreview };
    onUpdate(formData);
    
    setIsSubmitting(true);
    try {
      if (companyId) {
        // Update existing company
        await updateCompany(companyId, formData);
        toast.success("Company information updated");
      } else {
        // Create new company
        const company = await createCompany(formData);
        if (company) {
          setCompanyId(company.id);
          toast.success("Company created successfully");
        }
      }
    } catch (error: any) {
      console.error("Error saving company information:", error);
      toast.error(error.message || "Failed to save company information");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Building2 className="h-6 w-6 text-maintenease-600" />
        <h2 className="text-xl font-semibold">Company Information</h2>
      </div>
      
      <p className="text-muted-foreground">
        Set up your company profile to personalize your MaintenEase experience.
      </p>

      <div className="flex flex-col md:flex-row gap-8">
        <div className="w-full md:w-2/3">
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
        </div>
        
        <div className="w-full md:w-1/3">
          <CompanyLogoUploader 
            initialLogo={logoPreview} 
            onLogoChange={handleLogoChange} 
          />
        </div>
      </div>
    </div>
  );
};

export default CompanyInfoSetup;
