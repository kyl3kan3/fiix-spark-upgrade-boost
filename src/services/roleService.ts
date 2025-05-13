
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const updateUserRole = async (userId: string, role: string) => {
  try {
    // Ensure we're working with a valid user ID
    if (!userId) {
      throw new Error("Invalid user ID");
    }
    
    console.log("Updating role for user ID:", userId, "to role:", role);
    
    // Update user role in profiles table with proper return handling
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    
    // Get the updated profile to confirm changes
    const { data: updatedProfile, error: fetchError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
      
    if (fetchError) {
      console.error("Error fetching updated profile:", fetchError);
      throw fetchError;
    }
    
    console.log("Role update confirmed:", updatedProfile);
    
    // Return success with the updated profile data
    return { success: true, data: updatedProfile };
  } catch (error: any) {
    console.error("Error updating role:", error);
    toast.error(error.message || "Failed to update role. Please try again.");
    return { success: false, error };
  }
};
