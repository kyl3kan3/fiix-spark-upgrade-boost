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
export async function requireUserCompany(): Promise<UserContext> {
  const user = await requireUser();
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
 * unlinked. Use for best-effort lookups (audit logs, optional context) where
 * the caller should not abort on missing context.
 */
export async function tryGetUserCompany(): Promise<Partial<UserContext>> {
  const user = await getCurrentUser();
  if (!user) return {};
  const { data: profile } = await supabase
    .from("profiles")
    .select("company_id")
    .eq("id", user.id)
    .maybeSingle();
  return { userId: user.id, companyId: profile?.company_id ?? undefined };
}
