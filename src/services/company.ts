
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface CompanyData {
  name: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;  // Using snake_case to match database column
  phone?: string;
  email?: string;
  website?: string;
  logo?: string;
}

export const createCompany = async (data: CompanyData) => {
  try {
    const { data: userData, error: userError } = await supabase.auth.getUser();
    if (userError) {
      throw new Error("Failed to get current user");
    }
    
    if (!userData.user) {
      throw new Error("User not authenticated");
    }

    // Prepare company data with user ID
    const companyData = {
      ...data,
      created_by: userData.user.id
    };

    // Create company
    const { data: company, error } = await supabase
      .from("companies")
      .insert(companyData)
      .select()
      .single();

    if (error) {
      console.error("Error creating company:", error);
      throw new Error(`Failed to create company: ${error.message}`);
    }

    return company;
  } catch (error: any) {
    console.error("Error in createCompany:", error);
    throw error;
  }
};

export const updateCompany = async (id: string, data: Partial<CompanyData>) => {
  try {
    // Format data to match database schema
    const updateData: any = {
      ...data,
      updated_at: new Date().toISOString()
    };

    // Convert zipCode to zip_code for DB compatibility
    if (data.zip_code !== undefined) {
      updateData.zip_code = data.zip_code;
    }

    const { data: updatedCompany, error } = await supabase
      .from("companies")
      .update(updateData)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      console.error("Error updating company:", error);
      throw new Error(`Failed to update company: ${error.message}`);
    }

    return updatedCompany;
  } catch (error: any) {
    console.error("Error in updateCompany:", error);
    throw error;
  }
};

export const getCompany = async (id: string) => {
  try {
    const { data: company, error } = await supabase
      .from("companies")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      console.error("Error fetching company:", error);
      throw new Error(`Failed to fetch company: ${error.message}`);
    }

    return company;
  } catch (error: any) {
    console.error("Error in getCompany:", error);
    throw error;
  }
};
