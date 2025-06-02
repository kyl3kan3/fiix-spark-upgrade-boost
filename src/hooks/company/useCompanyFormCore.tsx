
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { companyInfoSchema, CompanyInfoFormValues } from "@/components/setup/company/companyInfoSchema";

export const useCompanyFormCore = (initialData: any, onUpdate: (data: any) => void) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  
  const form = useForm<CompanyInfoFormValues>({
    resolver: zodResolver(companyInfoSchema),
    defaultValues: {
      name: "",
      industry: "",
      address: "",
      city: "",
      state: "",
      zipCode: "",
      phone: "",
      email: "",
      website: "",
    },
  });

  // Initialize form with data only once
  useEffect(() => {
    if (initialData && Object.keys(initialData).length > 0 && !isInitialized) {
      console.log("Initializing form with data:", initialData);
      
      const formData = {
        name: initialData.name || "",
        industry: initialData.industry || "",
        address: initialData.address || "",
        city: initialData.city || "",
        state: initialData.state || "",
        zipCode: initialData.zipCode || "",
        phone: initialData.phone || "",
        email: initialData.email || "",
        website: initialData.website || "",
      };
      
      form.reset(formData);
      
      if (initialData.logo) {
        setLogoPreview(initialData.logo);
      }
      
      setIsInitialized(true);
    }
  }, [initialData, form, isInitialized]);

  // Auto-save when form values change (but only after initialization)
  useEffect(() => {
    if (!isInitialized) return;
    
    const subscription = form.watch((values) => {
      // Only call onUpdate if we have valid data
      if (values && typeof onUpdate === 'function') {
        try {
          onUpdate({ ...values, logo: logoPreview });
        } catch (error) {
          console.error("Error in onUpdate callback:", error);
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, logoPreview, onUpdate, isInitialized]);

  const handleLogoChange = (logoData: string | null) => {
    console.log("Logo change:", logoData ? "Present" : "None");
    setLogoPreview(logoData);
    
    if (isInitialized && typeof onUpdate === 'function') {
      try {
        onUpdate({ ...form.getValues(), logo: logoData });
      } catch (error) {
        console.error("Error updating logo:", error);
      }
    }
  };

  return {
    form,
    logoPreview,
    handleLogoChange,
    setLogoPreview,
    isInitialized
  };
};
