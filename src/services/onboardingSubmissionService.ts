import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";

interface ProfileDetails {
  firstName: string;
  lastName: string;
  phone?: string;
}

interface OwnerOnboardingDetails extends ProfileDetails {
  companyName: string;
  timezone: string;
}

function companyIdFromResult(result: Json): string | undefined {
  if (!result || typeof result !== "object" || Array.isArray(result)) {
    return undefined;
  }

  const companyId = result.company_id;
  return typeof companyId === "string" ? companyId : undefined;
}

export async function acceptOnboardingInvitation(
  token: string,
  details: ProfileDetails,
): Promise<string | undefined> {
  const { data, error } = await supabase.rpc("accept_invitation", {
    _token: token,
    _first_name: details.firstName,
    _last_name: details.lastName,
    _phone: details.phone,
  });
  if (error) throw error;
  return companyIdFromResult(data);
}

export async function completePersonalOnboarding(
  details: ProfileDetails,
): Promise<void> {
  const { error } = await supabase.rpc("complete_personal_onboarding", {
    _first_name: details.firstName,
    _last_name: details.lastName,
    _phone: details.phone,
  });
  if (error) throw error;
}

export async function completeOwnerOnboarding(
  details: OwnerOnboardingDetails,
): Promise<string> {
  const { data, error } = await supabase.rpc(
    "complete_owner_onboarding_with_timezone",
    {
      _company_name: details.companyName,
      _first_name: details.firstName,
      _last_name: details.lastName,
      _phone: details.phone,
      _timezone: details.timezone,
    },
  );
  if (error) throw error;

  const companyId = companyIdFromResult(data);
  if (!companyId) throw new Error("Company created without an id");
  return companyId;
}

export async function notifyTrialSignup(
  company: string,
  companyId: string,
): Promise<void> {
  const { error } = await supabase.functions.invoke("notify-trial-signup", {
    body: { company, companyId },
  });
  if (error) throw error;
}
