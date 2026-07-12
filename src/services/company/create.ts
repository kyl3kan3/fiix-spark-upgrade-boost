import { supabase } from "@/integrations/supabase/client";
import { requireUser } from "@/services/supabaseHelpers";
import type { CompanyInfo } from "@/components/profile/company/types";
import type { CompanyData } from "./types";
import { mapCompanyInfoToCompanyData } from "./utils";
import { getBrowserTimezone } from "@/constants/timezones";
import { logger } from "@/lib/logger";

/**
 * Creates a new tenant through the hardened owner-onboarding RPC. Existing
 * companies are never joined by name and role assignment stays server-side.
 */
export const createCompany = async (
  companyInfo: Partial<CompanyInfo>,
): Promise<CompanyData> => {
  const user = await requireUser();
  const dbData = mapCompanyInfoToCompanyData(companyInfo);
  if (!dbData.name?.trim()) throw new Error("Company name is required");

  const timezone = dbData.timezone || getBrowserTimezone();
  const { data: onboardingResult, error: onboardingError } = await supabase.rpc(
    "complete_owner_onboarding_with_timezone",
    {
      _company_name: dbData.name,
      _timezone: timezone,
    },
  );
  if (onboardingError) throw onboardingError;

  const companyId = (onboardingResult as { company_id?: string } | null)
    ?.company_id;
  if (!companyId) throw new Error("Company creation did not return an id");

  const { data: company, error: updateError } = await supabase
    .from("companies")
    .update({
      name: dbData.name,
      industry: dbData.industry,
      address: dbData.address,
      city: dbData.city,
      state: dbData.state,
      zip_code: dbData.zip_code,
      phone: dbData.phone,
      email: dbData.email || user.email || null,
      website: dbData.website,
      logo: dbData.logo,
      timezone,
      updated_at: new Date().toISOString(),
    })
    .eq("id", companyId)
    .select()
    .single();
  if (updateError) throw updateError;

  localStorage.setItem("maintenease_setup_complete", "true");
  logger.log("Company created through owner onboarding:", companyId);
  return company as CompanyData;
};
