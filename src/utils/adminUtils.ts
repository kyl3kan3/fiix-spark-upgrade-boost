
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

/**
 * Updates a user's role to administrator by their email address
 */
export const setUserAsAdmin = async (email: string): Promise<{ success: boolean, error?: any }> => {
  try {
    console.log(`Attempting to set user ${email} as administrator...`);
    
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
    console.log(`Found user with ID: ${userId}, current role: ${userProfiles[0].role}`);
    
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
    
    console.log(`Successfully updated ${email} to administrator role, response:`, data);
    return { success: true };
  } catch (error) {
    console.error("Error setting user as admin:", error);
    return { success: false, error };
  }
};
