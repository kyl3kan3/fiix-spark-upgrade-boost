import { supabase } from "@/integrations/supabase/client";

export interface UserContext {
  userId: string;
  companyId: string;
}

/**
 * Resolves the current authenticated user and their company_id.
 * Throws if the user is not signed in or has no company association.
 */
export async function requireUserCompany(): Promise<UserContext> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error("You must be signed in");
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();
  if (error) throw error;
  if (!profile?.company_id) throw new Error("Your account is not linked to a company");
  return { userId: user.id, companyId: profile.company_id };
}

/**
 * Returns user + company context if available, or nulls if unauthenticated /
 * unlinked. Use this for audit log writes and other best-effort lookups where
 * the caller should not be aborted on missing context.
 */
export async function tryGetUserCompany(): Promise<Partial<UserContext>> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { userId: undefined, companyId: undefined };
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();
  return {
    userId: user.id,
    companyId: profile?.company_id ?? undefined,
  };
}
