
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

interface CompanyInfoSetupProps {
  data: any;
  onUpdate: (data: any) => void;
}

const CompanyInfoSetup: React.FC<CompanyInfoSetupProps> = ({ data, onUpdate }) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
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

  // Utility to set current user as administrator if not already
  const setCurrentUserAsAdmin = async () => {
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) return;

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile || profile.role !== "administrator") {
      await supabase.from("profiles").update({ role: "administrator" }).eq("id", user.id);
    }
  };

  const onSubmit = async (values: CompanyInfoFormValues) => {
    const formData = { ...values, logo: logoPreview };
    onUpdate(formData);
    
    // Save company name to profile
    try {
      if (values.companyName) {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const { error } = await supabase
            .from('profiles')
            .update({ company_name: values.companyName })
            .eq('id', user.id);
            
          if (error) {
            console.error("Error updating company name in profile:", error);
            toast.error("Company name couldn't be saved to your profile");
            return;
          }
        }
      }
      
      toast.success("Company information saved");
    } catch (error) {
      console.error("Error saving company information:", error);
      toast.error("Failed to save company information");
    }

    // Assign admin to first user who sets up the company if not already admin
    await setCurrentUserAsAdmin();
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
              <Button type="submit">Save Company Information</Button>
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
