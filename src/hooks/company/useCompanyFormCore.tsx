
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { companyInfoSchema, CompanyInfoFormValues } from "@/components/setup/company/companyInfoSchema";

export const useCompanyFormCore = (initialData: any, onUpdate: (data: any) => void) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  
  const form = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      companyName: initialData?.companyName || "",
      industry: initialData?.industry || "",
      address: initialData?.address || "",
      city: initialData?.city || "",
      state: initialData?.state || "",
      zipCode: initialData?.zipCode || "",
      phone: initialData?.phone || "",
      email: initialData?.email || "",
      website: initialData?.website || "",
    },
  });

  // Initialize logo preview from existing data
  useEffect(() => {
    if (initialData?.logo) {
      setLogoPreview(initialData.logo);
    }
  }, [initialData]);

  // Auto-save when form values change
  useEffect(() => {
    const subscription = form.watch((values) => {
      onUpdate({ ...values, logo: logoPreview });
    });
    
    return () => subscription.unsubscribe();
  }, [form, logoPreview, onUpdate]);

  const handleLogoChange = (logoData: string | null) => {
    setLogoPreview(logoData);
    onUpdate({ ...form.getValues(), logo: logoData });
  };

  return {
    form,
    logoPreview,
    handleLogoChange,
    setLogoPreview
  };
};
