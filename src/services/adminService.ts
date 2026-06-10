import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/services/supabaseHelpers";

export interface SetUserAsAdminResult {
  success: boolean;
  error?: { message?: string };
}

/**
 * Updates a user's role to administrator by their email address.
 * Never throws — failures are reported via the returned `error` field.
 */
export const setUserAsAdmin = async (email: string): Promise<SetUserAsAdminResult> => {
  try {
    // Query to find the user by email
    const { data: userProfiles, error: queryError } = await supabase
      .from("profiles")
      .select("id, email, company_id")
      .eq("email", email);

    if (queryError) {
      console.error("Error finding user:", queryError);
      throw queryError;
    }

    if (!userProfiles || userProfiles.length === 0) {
      const errorMessage = `No user found with email: ${email}`;
      console.error(errorMessage);
      throw new Error(errorMessage);
    }

    const userId = userProfiles[0].id;
    const companyId = userProfiles[0].company_id;

    if (!companyId) {
      throw new Error("User has no company association");
    }

    // Delete existing roles for this user in this company
    await supabase
      .from("user_roles")
      .delete()
      .eq("user_id", userId)
      .eq("company_id", companyId);

    // Insert administrator role
    const currentUser = await getCurrentUser();
    const { error: insertError } = await supabase
      .from("user_roles")
      .insert([{
        user_id: userId,
        role: "administrator" as const,
        company_id: companyId,
        created_by: currentUser?.id,
      }]);

    if (insertError) {
      console.error("Error inserting admin role:", insertError);
      throw insertError;
    }

    // Also update profiles table for backward compatibility
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ role: "administrator" })
      .eq("id", userId);

    if (updateError) {
      console.error("Error updating profile:", updateError);
    }

    return { success: true };
  } catch (error) {
    console.error("Error setting user as admin:", error);
    return { success: false, error: error as { message?: string } };
  }
};
