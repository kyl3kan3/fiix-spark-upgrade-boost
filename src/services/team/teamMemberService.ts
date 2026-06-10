
import { supabase } from "@/integrations/supabase/client";

/** Column-level updates for a team member's profile row. */
export interface TeamMemberProfileUpdate {
  first_name?: string;
  last_name?: string;
  role?: string;
  email?: string;
  phone_number?: string;
}

/**
 * Updates a team member's profile and returns the updated rows.
 * Throws on error.
 */
export async function updateTeamMemberProfile(
  userId: string,
  updateData: TeamMemberProfileUpdate
) {
  const { data, error } = await supabase
    .from("profiles")
    .update(updateData)
    .eq("id", userId)
    .select();

  if (error) throw error;
  return data;
}
