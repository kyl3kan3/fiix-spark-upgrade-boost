
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Updates a user's role to administrator by their email address
 */
export const setUserAsAdmin = async (email: string): Promise<{ success: boolean, error?: any }> => {
  try {
    // Query to find the user by email
    const { data: userProfiles, error: queryError } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', email);
      
    if (queryError) {
      console.error("Error finding user:", queryError);
      throw queryError;
    }
    
    if (!userProfiles || userProfiles.length === 0) {
      console.error("No user found with email:", email);
      throw new Error(`No user found with email: ${email}`);
    }
    
    const userId = userProfiles[0].id;
    
    // Update the user's role to administrator
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'administrator' })
      .eq('id', userId);
      
    if (updateError) {
      console.error("Error updating user role:", updateError);
      throw updateError;
    }
    
    console.log(`Successfully updated ${email} to administrator role`);
    return { success: true };
  } catch (error) {
    console.error("Error setting user as admin:", error);
    return { success: false, error };
  }
};
