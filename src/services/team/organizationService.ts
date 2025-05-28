
import { supabase } from "@/integrations/supabase/client";

export async function getOrCreateOrganization(userId: string) {
  console.log("2. Fetching user profile...");
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("2. FAILED: Error fetching profile:", profileError);
    throw new Error(`Failed to fetch user profile: ${profileError.message}`);
  }

  if (!profile.company_id) {
    console.error("2. FAILED: No company associated with profile:", profile);
    throw new Error("No company associated with your account");
  }

  console.log("2. SUCCESS: User profile fetched", { companyId: profile.company_id });

  // Get company name for the invitation email
  console.log("3. Fetching company information...");
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("name")
    .eq("id", profile.company_id)
    .single();
  
  if (companyError) {
    console.error("3. FAILED: Error fetching company:", companyError);
    throw new Error(`Failed to fetch company information: ${companyError.message}`);
  }

  console.log("3. SUCCESS: Company information fetched", { companyName: company?.name });

  // Check if organization already exists
  console.log("4. Checking if organization exists...");
  const { data: existingOrg, error: orgCheckError } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", profile.company_id)
    .maybeSingle();

  if (orgCheckError) {
    console.error("4. FAILED: Error checking organization:", orgCheckError);
    throw new Error(`Failed to check organization: ${orgCheckError.message}`);
  }

  let organizationId = profile.company_id;

  // If organization doesn't exist, create it
  if (!existingOrg) {
    console.log("4. Organization doesn't exist, creating it...");
    
    // Create organization
    const { data: newOrg, error: createOrgError } = await supabase
      .from("organizations")
      .insert({
        id: profile.company_id,
        name: company?.name || "Organization"
      })
      .select()
      .single();
      
    if (createOrgError) {
      console.error("4. FAILED: Error creating organization:", createOrgError);
      throw new Error(`Failed to create organization: ${createOrgError.message}`);
    }
    
    organizationId = newOrg.id;
    console.log("4. SUCCESS: Created organization:", organizationId);
  } else {
    console.log("4. SUCCESS: Organization exists:", existingOrg.id);
  }

  return {
    organizationId,
    companyName: company?.name || "Organization"
  };
}
