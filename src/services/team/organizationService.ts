
import { supabase } from "@/integrations/supabase/client";

export async function getOrCreateOrganization(userId: string) {
  console.log("🏢 Getting organization for user:", userId);
  
  console.log("👤 Fetching user profile...");
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("❌ Error fetching profile:", profileError);
    throw new Error(`Failed to fetch user profile: ${profileError.message}`);
  }

  if (!profile.company_id) {
    console.error("❌ No company associated with profile:", profile);
    throw new Error("No company associated with your account");
  }

  console.log("✅ User profile fetched, company_id:", profile.company_id);

  console.log("🏢 Fetching company information...");
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("name")
    .eq("id", profile.company_id)
    .single();
  
  if (companyError) {
    console.error("❌ Error fetching company:", companyError);
    throw new Error(`Failed to fetch company information: ${companyError.message}`);
  }

  console.log("✅ Company information fetched:", company?.name);

  console.log("🔍 Checking if organization exists...");
  const { data: existingOrg, error: orgCheckError } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", profile.company_id)
    .maybeSingle();

  if (orgCheckError) {
    console.error("❌ Error checking organization:", orgCheckError);
    throw new Error(`Failed to check organization: ${orgCheckError.message}`);
  }

  let organizationId = profile.company_id;

  if (!existingOrg) {
    console.log("➕ Organization doesn't exist, creating it...");
    
    const { data: newOrg, error: createOrgError } = await supabase
      .from("organizations")
      .insert({
        id: profile.company_id,
        name: company?.name || "Organization"
      })
      .select()
      .single();
      
    if (createOrgError) {
      console.error("❌ Error creating organization:", createOrgError);
      throw new Error(`Failed to create organization: ${createOrgError.message}`);
    }
    
    organizationId = newOrg.id;
    console.log("✅ Created organization:", organizationId);
  } else {
    console.log("✅ Organization exists:", existingOrg.id);
  }

  return {
    organizationId,
    companyName: company?.name || "Organization"
  };
}
