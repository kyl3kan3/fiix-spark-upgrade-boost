
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";

export const updateUserRole = async (userId: string, role: string) => {
  try {
    // Ensure we're working with a valid user ID
    if (!userId) {
      throw new Error("Invalid user ID");
    }
    
    console.log("Updating role for user ID:", userId, "to role:", role);
    
    // Update user role in profiles table with proper return handling
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role })
      .eq('id', userId);
    
    if (updateError) {
      console.error("Supabase update error:", updateError);
      throw updateError;
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
    
    // Verify the role was actually updated
    if (updatedProfile.role !== role) {
      console.error("Role was not updated correctly. Expected:", role, "Actual:", updatedProfile.role);
      throw new Error("Role update did not take effect. Please try again.");
    }
    
    // Return success with the updated profile data
    return { success: true, data: updatedProfile };
  } catch (error: any) {
    console.error("Error updating role:", error);
    toast({
      title: "Error updating role",
      description: error.message || "Failed to update role. Please try again.",
      variant: "destructive" 
    });
    return { success: false, error };
  }
};
