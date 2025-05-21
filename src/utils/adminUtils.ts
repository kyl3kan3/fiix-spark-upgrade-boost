
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
      .select('id, email, role')
      .eq('email', email);
      
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
    
    // Update the user's role to administrator
    const { data, error: updateError } = await supabase
      .from('profiles')
      .update({ role: 'administrator' })
      .eq('id', userId)
      .select();
      
    if (updateError) {
      console.error("Error updating user role:", updateError);
      throw updateError;
    }
    
    return { success: true };
  } catch (error) {
    console.error("Error setting user as admin:", error);
    return { success: false, error };
  }
};
