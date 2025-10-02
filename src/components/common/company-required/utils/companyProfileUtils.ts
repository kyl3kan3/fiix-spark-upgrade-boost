import { supabase } from "@/integrations/supabase/client";

/**
 * Check if a profile exists for the user
 */
export const checkUserProfile = async (userId: string) => {
  const { data: profileExists, error: profileCheckError } = await supabase
    .from('profiles')
    .select('id')
    .eq('id', userId)
    .maybeSingle();
    
  if (profileCheckError) {
    console.error("Error checking profile existence:", profileCheckError);
  }
  
  return { profileExists, profileCheckError };
};

/**
 * Create a default company for a user
 */
export const createDefaultCompany = async (userId: string) => {
  const { data: newCompany, error: createCompanyError } = await supabase
    .from('companies')
    .insert({
      name: 'Default Company',
      created_by: userId
    })
    .select('id')
    .single();
    
  if (createCompanyError) {
    console.error("Error creating default company:", createCompanyError);
    return { companyId: null, error: createCompanyError };
  }
  
  return { companyId: newCompany.id, error: null };
};

/**
 * Find an existing company or create a new one
 */
export const findOrCreateCompany = async (userId: string) => {
  // Try to find an existing company first
  const { data: defaultCompany, error: companyError } = await supabase
    .from('companies')
    .select('id')
    .limit(1)
    .maybeSingle();
    
  if (companyError) {
    console.error("Error finding default company:", companyError);
    
    // If no companies exist, create one
    if (companyError.code === 'PGRST116') {
      return await createDefaultCompany(userId);
    }
    
    return { companyId: null, error: companyError };
  }
  
  // If company exists, return it
  if (defaultCompany) {
    return { companyId: defaultCompany.id, error: null };
  }
  
  // Otherwise create a new company
  return await createDefaultCompany(userId);
};

/**
 * Create a user profile with company association
 */
export const createUserProfile = async (userId: string, email: string, companyId: string) => {
  // Create profile
  const { error: createError } = await supabase
    .from('profiles')
    .insert({
      id: userId,
      email: email,
      role: 'technician',
      company_id: companyId
    });
    
  if (createError) {
    console.error("Error creating profile:", createError);
    return { success: false, error: createError };
  }

  // Create user role entry
  const { error: roleError } = await supabase
    .from('user_roles')
    .insert([{
      user_id: userId,
      role: 'technician' as any,
      company_id: companyId
    }] as any);

  if (roleError) {
    console.error("Error creating user role:", roleError);
    // Continue anyway, the role in profiles table will still work
  }
  
  return { success: true, error: null };
};

/**
 * Get user's profile with company ID
 */
export const getUserProfileWithCompany = async (userId: string) => {
  const { data: profile, error: fetchError } = await supabase
    .from('profiles')
    .select('company_id, role')
    .eq('id', userId)
    .maybeSingle();
    
  if (fetchError) {
    console.error("Error fetching user profile:", fetchError);
    return { profile: null, error: fetchError };
  }
  
  return { profile, error: null };
};
