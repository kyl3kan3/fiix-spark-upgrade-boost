import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export interface UserContext {
  userId: string;
  companyId: string;
}

/** Returns the current authenticated user, or null if unauthenticated. */
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user } } = await supabase.auth.getUser();
  return user ?? null;
}

/** Returns the current authenticated user, or throws if unauthenticated. */
export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) throw new Error("You must be signed in");
  return user;
}

/**
 * Resolves the current authenticated user and their company_id.
 * Throws if the user is not signed in or has no company association.
 */
export async function resolveCompanyIdForUser(userId: string): Promise<string | null> {
  const { data: profile, error: profileError } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", userId)
    .maybeSingle();
  if (profileError) throw profileError;
  if (profile?.company_id) return profile.company_id;

  const { data: rpcCompany, error: rpcError } = await supabase.rpc("get_user_company", {
    _user_id: userId,
  });
  if (rpcError) throw rpcError;
  const companyId = typeof rpcCompany === "string" ? rpcCompany : null;
  return companyId;
}

export async function requireUserCompany(): Promise<UserContext> {
  const user = await requireUser();
  const companyId = await resolveCompanyIdForUser(user.id);
  if (!companyId) throw new Error("Your account is not linked to a company");
  return { userId: user.id, companyId };
}

/**
 * Returns user + company context if available, or nulls if unauthenticated /
 * unlinked. Use for best-effort lookups (audit logs, optional context) where
 * the caller should not abort on missing context.
 */
export async function tryGetUserCompany(): Promise<Partial<UserContext>> {
  const user = await getCurrentUser();
  if (!user) return {};
  try {
    const companyId = await resolveCompanyIdForUser(user.id);
    return { userId: user.id, companyId: companyId ?? undefined };
  } catch {
    return { userId: user.id };
  }
}
