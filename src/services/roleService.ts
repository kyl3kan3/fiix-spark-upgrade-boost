
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export const updateUserRole = async (userId: string, role: string) => {
  try {
    // Ensure we're working with a valid user ID
    if (!userId) {
      throw new Error("Invalid user ID");
    }
    
    console.log("Updating role for user ID:", userId, "to role:", role);
    
    // Update user role in profiles table
    const { data, error } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId)
      .select();
    
    if (error) {
      console.error("Supabase error:", error);
      throw error;
    }
    
    console.log("Role update response:", data);
    return { success: true, data };
  } catch (error: any) {
    console.error("Error updating role:", error);
    toast.error(error.message || "Failed to update role. Please try again.");
    return { success: false, error };
  }
};
