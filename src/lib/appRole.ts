import type { Database } from "@/integrations/supabase/types";

/** Values in `public.app_role` (authoritative store: `public.user_roles`). */
export type AppRole = Database["public"]["Enums"]["app_role"];

/**
 * Default role assigned to new accounts. Matches `handle_new_user`,
 * `force_default_profile_role`, and profiles INSERT RLS in Supabase.
 */
export const DEFAULT_PROFILE_ROLE = "technician" satisfies AppRole;

export function buildNewProfileInsert(userId: string, email: string | undefined) {
  return {
    id: userId,
    email: email || "",
    first_name: "",
    last_name: "",
    phone_number: "",
    company_id: "",
    company_name: "",
    role: DEFAULT_PROFILE_ROLE,
    avatar_url: null,
  };
}
