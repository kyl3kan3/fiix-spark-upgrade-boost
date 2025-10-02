
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Helper to wait for a few milliseconds
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const updateUserRole = async (userId: string, role: string) => {
  try {
    if (!userId) throw new Error("Invalid user ID");
    console.log("Updating role for user ID:", userId, "to role:", role);

    // Get user's company_id
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('company_id')
      .eq('id', userId)
      .single();

    if (profileError || !profile?.company_id) {
      throw new Error("Could not find user's company");
    }

    // Delete existing role for this user in this company
    const { error: deleteError } = await supabase
      .from('user_roles')
      .delete()
      .eq('user_id', userId)
      .eq('company_id', profile.company_id);

    if (deleteError) {
      console.error("Error deleting old role:", deleteError);
    }

    // Insert new role
    const currentUser = await supabase.auth.getUser();
    const { error: insertError } = await supabase
      .from('user_roles')
      .insert([{
        user_id: userId,
        role: role as any,
        company_id: profile.company_id,
        created_by: currentUser.data.user?.id
      }] as any);

    if (insertError) {
      console.error("Error inserting new role:", insertError);
      throw insertError;
    }

    // Also update the role in profiles table for backward compatibility
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (updateError) {
      console.error("Error updating profiles table:", updateError);
    }

    // Wait a little for DB to settle
    await wait(250);

    // Verify the role was updated
    const { data: updatedRole, error: fetchError } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('company_id', profile.company_id)
      .single();
      
    if (fetchError) {
      console.error("Error fetching updated role:", fetchError);
      throw fetchError;
    }

    if (!updatedRole) {
      throw new Error("Role update did not take effect.");
    }

    console.log("Role update confirmed:", updatedRole);
    return { success: true, data: { role: updatedRole.role } };
  } catch (error: any) {
    console.error("Error updating role:", error);
    toast(error.message || "Failed to update role. Please try again.");
    return { success: false, error };
  }
};
