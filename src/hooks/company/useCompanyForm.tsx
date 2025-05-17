
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { companyInfoSchema, CompanyInfoFormValues } from "@/components/setup/company/companyInfoSchema";
import { supabase } from "@/integrations/supabase/client";
import { createCompany, updateCompany, fetchUserCompany, mapCompanyToCompanyInfo } from "@/services/company";

export const useCompanyForm = (initialData: any, onUpdate: (data: any) => void) => {
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  
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

  // Get current user
  useEffect(() => {
    const getCurrentUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setUserId(user.id);
        console.log("Current user ID:", user.id);
      }
    };
    
    getCurrentUser();
  }, []);

  // Check if we have company data from profile edit
  useEffect(() => {
    const loadStoredEditData = () => {
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
    };

    loadStoredEditData();
  }, [form]);
  
  // Load existing company data
  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const company = await fetchUserCompany();
        if (company) {
          console.log("Found existing company:", company);
          setCompanyId(company.id);
          const companyInfo = mapCompanyToCompanyInfo(company);
          form.reset(companyInfo);
          if (company.logo) {
            setLogoPreview(company.logo);
          }
        } else {
          console.log("No existing company found for user");
        }
      } catch (error) {
        console.error("Error loading company data:", error);
      }
    };
    
    loadCompanyData();
  }, [form]);

  // Initialize logo preview from existing data
  useEffect(() => {
    if (initialData?.logo) {
      setLogoPreview(initialData.logo);
    }
  }, [initialData]);

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

  // Check and fix user profile if needed
  const checkAndFixUserProfile = async (companyId: string) => {
    if (!userId) return false;
    
    try {
      // Check current profile
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id, role, email")
        .eq("id", userId)
        .maybeSingle();
      
      console.log("Current user profile:", profile);
      
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email || '';
      
      // If profile doesn't exist or company_id is not set
      if (!profile || !profile.company_id) {
        console.log("Fixing user profile - setting company_id and role");
        
        // Try to update/create profile
        const { error: updateError } = await supabase
          .from("profiles")
          .upsert({
            id: userId,
            company_id: companyId,
            role: "administrator",
            email: email
          });
        
        if (updateError) {
          console.error("Error fixing user profile:", updateError);
          throw updateError;
        } else {
          console.log("User profile fixed successfully");
          return true;
        }
      }
      
      return true;
    } catch (error) {
      console.error("Error checking/fixing user profile:", error);
      return false;
    }
  };

  const handleSubmit = async (values: CompanyInfoFormValues) => {
    const formData = { ...values, logo: logoPreview };
    onUpdate(formData);
    
    setIsSubmitting(true);
    try {
      let updatedCompanyId = companyId;
      
      if (companyId) {
        // Update existing company
        await updateCompany(companyId, formData);
        
        // Ensure user profile is linked to company
        await checkAndFixUserProfile(companyId);
        
        toast.success("Company information updated");
      } else {
        // Create new company
        const company = await createCompany(formData);
        if (company) {
          updatedCompanyId = company.id;
          setCompanyId(company.id);
          
          // Make sure user profile is updated with the company ID
          await checkAndFixUserProfile(company.id);
          
          // Set completion flag
          localStorage.setItem('maintenease_setup_complete', 'true');
          
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

  return {
    form,
    logoPreview,
    companyId,
    isSubmitting,
    handleLogoChange,
    handleSubmit
  };
};
