
import { supabase } from "@/integrations/supabase/client";

// Function to send an in-app notification
export const sendInAppNotification = async (
  title: string,
  body: string,
  userId: string,
  referenceId?: string
): Promise<void> => {
  const { error } = await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      body,
      type: 'in_app',
      reference_id: referenceId
    });
  
  if (error) throw error;
};

// Function to send an email notification
export const sendEmailNotification = async (
  to: string,
  subject: string,
  body: string,
  userId: string,
  referenceId?: string
): Promise<void> => {
  console.log("=== EMAIL NOTIFICATION START ===");
  console.log("sendEmailNotification called with:", { to, subject, userId, referenceId });
  
  try {
    console.log("About to invoke send-email edge function...");
    
    const { data, error } = await supabase.functions.invoke("send-email", {
      body: {
        to,
        subject,
        body,
        userId,
        notificationType: 'email',
        referenceId
      }
    });
    
    console.log("Edge function response received:", { data, error });
    
    if (error) {
      console.error("Edge function returned error:", error);
      throw new Error(`Email service error: ${error.message || 'Unknown error'}`);
    }

    if (!data || !data.success) {
      console.error("Edge function returned unsuccessful response:", data);
      throw new Error(`Email sending failed: ${data?.error || 'Unknown error'}`);
    }

    console.log("Email function invoked successfully:", data);

    // Also store in notifications table
    console.log("Storing notification in database...");
    const { error: dbError } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title: subject,
        body,
        type: 'email',
        reference_id: referenceId
      });
    
    if (dbError) {
      console.error("Database storage error:", dbError);
      // Don't throw here, email was sent successfully
    } else {
      console.log("Email notification stored in database successfully");
    }
    
    console.log("=== EMAIL NOTIFICATION SUCCESS ===");
  } catch (err) {
    console.error("=== EMAIL NOTIFICATION FAILED ===");
    console.error("Error in sendEmailNotification:", err);
    throw err;
  }
};

// Function to send an SMS notification
export const sendSmsNotification = async (
  to: string,
  body: string,
  userId: string,
  referenceId?: string
): Promise<void> => {
  const { error } = await supabase.functions.invoke("send-sms", {
    body: {
      to,
      body,
      userId,
      notificationType: 'sms',
      referenceId
    }
  });
  
  if (error) throw error;

  // Also store in notifications table
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title: "SMS Notification",
      body,
      type: 'sms',
      reference_id: referenceId
    });
};

// Function to send a push notification
export const sendPushNotification = async (
  token: string,
  title: string,
  body: string,
  userId: string,
  referenceId?: string
): Promise<void> => {
  const { error } = await supabase.functions.invoke("send-push", {
    body: {
      token,
      title,
      body,
      userId,
      notificationType: 'push',
      referenceId
    }
  });
  
  if (error) throw error;

  // Also store in notifications table
  await supabase
    .from('notifications')
    .insert({
      user_id: userId,
      title,
      body,
      type: 'push',
      reference_id: referenceId
    });
};
