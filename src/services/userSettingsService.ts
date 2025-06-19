
import { supabase } from "@/integrations/supabase/client";

export const getUserSettings = async () => {
  try {
    // Check if user is authenticated first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError) {
      console.error("Auth error:", authError);
      throw new Error("User not authenticated");
    }
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from('user_settings')
      .select('*')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error) {
      console.error("Error fetching user settings:", error);
      throw error;
    }

    // Return default settings if none exist
    if (!data) {
      return {
        notification_preferences: {
          sms_notifications: false,
          push_notifications: false,
          email_notifications: true
        },
        display_settings: {
          dark_mode: false,
          compact_mode: false
        },
        dashboard_layout: 'Default',
        setup_completed: false
      };
    }

    return data;
  } catch (error) {
    console.error("Error loading user settings:", error);
    throw error;
  }
};

export const updateUserSettings = async (settings: any) => {
  try {
    // Check if user is authenticated first
    const { data: { user }, error: authError } = await supabase.auth.getUser();
    
    if (authError || !user) {
      throw new Error("User not authenticated");
    }

    const { data, error } = await supabase
      .from('user_settings')
      .upsert({
        user_id: user.id,
        ...settings,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.error("Error updating user settings:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error updating user settings:", error);
    throw error;
  }
};
