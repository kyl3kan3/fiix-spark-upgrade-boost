import { supabase } from "@/integrations/supabase/client";

/**
 * Records a public (unauthenticated) SMS opt-in from the marketing form.
 * Throws on insert failure.
 */
export async function submitSmsOptIn(phoneNumber: string, userAgent: string): Promise<void> {
  const { error } = await supabase.from("sms_optins").insert({
    phone_number: phoneNumber,
    consent: true,
    source: "web_form",
    user_agent: userAgent,
  });
  if (error) throw error;
}
