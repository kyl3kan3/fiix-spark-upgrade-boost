
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/lib/logger";

export async function getOrCreateOrganization(userId: string, addStatusUpdate?: (message: string) => void) {
  logger.log("🏢 Getting organization for user:", userId);
  addStatusUpdate?.("🏢 Starting organization setup...");
  
  logger.log("👤 Fetching user profile...");
  addStatusUpdate?.("👤 Fetching your user profile...");
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", userId)
    .single();

  if (profileError) {
    console.error("❌ Error fetching profile:", profileError);
    addStatusUpdate?.("❌ Failed to fetch user profile");
    throw new Error(`Failed to fetch user profile: ${profileError.message}`);
  }

  if (!profile.company_id) {
    console.error("❌ No company associated with profile:", profile);
    addStatusUpdate?.("❌ No company found in your profile");
    throw new Error("No company associated with your account");
  }

  logger.log("✅ User profile fetched, company_id:", profile.company_id);
  addStatusUpdate?.("✅ Found your company ID");

  logger.log("🏢 Fetching company information...");
  addStatusUpdate?.("🏢 Getting company information...");
  const { data: company, error: companyError } = await supabase
    .from("companies")
    .select("name")
    .eq("id", profile.company_id)
    .single();
  
  if (companyError) {
    console.error("❌ Error fetching company:", companyError);
    addStatusUpdate?.("❌ Failed to fetch company details");
    throw new Error(`Failed to fetch company information: ${companyError.message}`);
  }

  logger.log("✅ Company information fetched:", company?.name);
  addStatusUpdate?.("✅ Got company details");

  logger.log("🔍 Checking if organization exists...");
  addStatusUpdate?.("🔍 Checking organization record...");
  const { data: existingOrg, error: orgCheckError } = await supabase
    .from("organizations")
    .select("id")
    .eq("id", profile.company_id)
    .maybeSingle();

  if (orgCheckError) {
    console.error("❌ Error checking organization:", orgCheckError);
    addStatusUpdate?.("❌ Failed to check organization");
    throw new Error(`Failed to check organization: ${orgCheckError.message}`);
  }

  let organizationId = profile.company_id;

  if (!existingOrg) {
    logger.log("➕ Organization doesn't exist, creating it...");
    addStatusUpdate?.("➕ Creating organization record...");
    
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
      addStatusUpdate?.("❌ Failed to create organization");
      throw new Error(`Failed to create organization: ${createOrgError.message}`);
    }
    
    organizationId = newOrg.id;
    logger.log("✅ Created organization:", organizationId);
    addStatusUpdate?.("✅ Organization created successfully");
  } else {
    logger.log("✅ Organization exists:", existingOrg.id);
    addStatusUpdate?.("✅ Organization already exists");
  }

  addStatusUpdate?.("🎉 Organization setup complete");
  return {
    organizationId,
    companyName: company?.name || "Organization"
  };
}
