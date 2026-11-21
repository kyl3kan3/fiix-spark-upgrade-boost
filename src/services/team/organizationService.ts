
import { supabase } from "@/integrations/supabase/client";

/**
 * Fetches an organization row (id only) by id. Returns null when the
 * organization does not exist. Throws on query error.
 */
export async function getOrganizationById(organizationId: string) {
 const { data, error } = await supabase
 .from("organizations")
 .select("id")
 .eq("id", organizationId)
 .maybeSingle();

 if (error) throw error;
 return data;
}

/**
 * Creates the organizations row for a company id when it is missing, copying
 * the name from the companies table. Throws when the company cannot be found
 * or the organization cannot be created.
 */
export async function createOrganizationFromCompany(organizationId: string) {
 const { data: company, error: companyError } = await supabase
 .from("companies")
 .select("name")
 .eq("id", organizationId)
 .single();

 if (companyError) {
 throw new Error(`Could not find company: ${companyError.message}`);
 }

 const { data: existingOrg } = await supabase
 .from("organizations")
 .select("id")
 .eq("id", organizationId)
 .maybeSingle();

 if (!existingOrg) {
 const { error: createOrgError } = await supabase
 .from("organizations")
 .insert({
 id: organizationId,
 name: company.name
 });

 if (createOrgError) {
 throw new Error(`Error creating organization: ${createOrgError.message}`);
 }
 }
}

/**
 * Best-effort variant used during invite acceptance: creates the
 * organizations row from company data when missing. Failures are logged but
 * not thrown so the caller can continue the accept flow.
 */
export async function tryCreateOrganizationFromCompany(organizationId: string) {
 const { data: company } = await supabase
 .from("companies")
 .select("name")
 .eq("id", organizationId)
 .single();

 if (company) {
 const { data: existingOrg } = await supabase
 .from("organizations")
 .select("id")
 .eq("id", organizationId)
 .maybeSingle();

 if (!existingOrg) {
 const { error: createOrgError } = await supabase
 .from("organizations")
 .insert({
 id: organizationId,
 name: company.name
 });

 if (createOrgError) {
 console.error("Error creating organization:", createOrgError);
 }
 }
 }
}

export async function getOrCreateOrganization(userId: string, addStatusUpdate?: (message: string) => void) {
 addStatusUpdate?.("🏢 Starting organization setup...");

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

 addStatusUpdate?.("✅ Found your company ID");

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

 addStatusUpdate?.("✅ Got company details");

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
 addStatusUpdate?.("✅ Organization created successfully");
 } else {
 addStatusUpdate?.("✅ Organization already exists");
 }

 addStatusUpdate?.("🎉 Organization setup complete");
 return {
 organizationId,
 companyName: company?.name || "Organization"
 };
}
