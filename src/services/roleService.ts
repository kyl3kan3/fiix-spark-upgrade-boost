
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

// Helper to wait for a few milliseconds
const wait = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export const updateUserRole = async (userId: string, role: string) => {
  try {
    if (!userId) throw new Error("Invalid user ID");
    console.log("Updating role for user ID:", userId, "to role:", role);

    // 1. Perform the update
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);

    if (updateError) {
      console.error("Supabase update error:", updateError);
      throw updateError;
    }

    // 2. Wait a little for DB to settle (addresses race condition)
    await wait(250);

    // 3. Fetch the updated profile
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', userId)
      .maybeSingle(); // Avoid .single() in case no data found
      
    if (fetchError) {
      console.error("Error fetching updated profile:", fetchError);
      throw fetchError;
    }
    if (!updatedProfile) {
      console.error("No profile returned after role update for user:", userId);
      throw new Error("No profile returned after update.");
    }
    console.log(`Fetched updated profile:`, updatedProfile, "checking role match with:", role);

    // 4. Robust comparison
    if (
      String(updatedProfile.role).trim().toLowerCase() !== String(role).trim().toLowerCase()
    ) {
      console.error(
        `Role was not updated correctly. Expected: "${role}", Actual: "${updatedProfile.role}"`
      );
      throw new Error("Role update did not take effect. Please try again.");
    }

    console.log("Role update confirmed:", updatedProfile);
    return { success: true, data: updatedProfile };
  } catch (error: any) {
    console.error("Error updating role:", error);
    toast(error.message || "Failed to update role. Please try again.");
    return { success: false, error };
  }
};
