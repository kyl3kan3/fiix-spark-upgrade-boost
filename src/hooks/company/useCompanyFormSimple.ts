
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { CompanyInfoFormValues, companyInfoSchema } from "@/components/setup/company/companyInfoSchema";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";

export function useCompanyFormSimple(initialData?: any, onUpdate?: (data: any) => void) {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [companyId, setCompanyId] = useState<string | null>(null);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

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
      website: ""
    }
  });

  // Load existing company data
  useEffect(() => {
    const loadCompanyData = async () => {
      if (!user) return;

      try {
        setIsLoading(true);
        
        // Get user's profile to find company_id
        const { data: profile } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", user.id)
          .single();

        if (profile?.company_id) {
          setCompanyId(profile.company_id);
          
          // Load company data
          const { data: company } = await supabase
            .from("companies")
            .select("*")
            .eq("id", profile.company_id)
            .single();

          if (company) {
            form.reset({
              name: company.name || "",
              industry: company.industry || "",
              address: company.address || "",
              city: company.city || "",
              state: company.state || "",
              zipCode: company.zip_code || "",
              phone: company.phone || "",
              email: company.email || "",
              website: company.website || ""
            });
            setLogoPreview(company.logo);
          }
        }
      } catch (error) {
        console.error("Error loading company data:", error);
        toast.error("Failed to load company information");
      } finally {
        setIsLoading(false);
      }
    };

    loadCompanyData();
  }, [user, form]);

  const handleLogoChange = (logoUrl: string | null) => {
    setLogoPreview(logoUrl);
  };

  const handleSubmit = async (values: CompanyInfoFormValues) => {
    if (!user) return;

    try {
      setIsSubmitting(true);
      
      let currentCompanyId = companyId;

      if (!currentCompanyId) {
        // Create new company
        const { data: newCompany, error: companyError } = await supabase
          .from("companies")
          .insert({
            name: values.name,
            industry: values.industry,
            address: values.address,
            city: values.city,
            state: values.state,
            zip_code: values.zipCode,
            phone: values.phone,
            email: values.email,
            website: values.website,
            logo: logoPreview,
            created_by: user.id
          })
          .select()
          .single();

        if (companyError) throw companyError;
        currentCompanyId = newCompany.id;
        setCompanyId(currentCompanyId);

        // Update user profile with company_id
        const { error: profileError } = await supabase
          .from("profiles")
          .update({ company_id: currentCompanyId })
          .eq("id", user.id);

        if (profileError) throw profileError;
        
        toast.success("Company created successfully!");
      } else {
        // Update existing company
        const { error: updateError } = await supabase
          .from("companies")
          .update({
            name: values.name,
            industry: values.industry,
            address: values.address,
            city: values.city,
            state: values.state,
            zip_code: values.zipCode,
            phone: values.phone,
            email: values.email,
            website: values.website,
            logo: logoPreview,
            updated_at: new Date().toISOString()
          })
          .eq("id", currentCompanyId);

        if (updateError) throw updateError;
        
        toast.success("Company information updated successfully!");
      }

      // Call onUpdate if provided (for setup flow)
      if (onUpdate) {
        onUpdate({ 
          companyId: currentCompanyId, 
          ...values, 
          logo: logoPreview 
        });
      }

    } catch (error: any) {
      console.error("Error saving company:", error);
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
    isLoading,
    handleLogoChange,
    handleSubmit: form.handleSubmit(handleSubmit)
  };
}
