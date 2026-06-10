import { supabase } from "@/integrations/supabase/client";

export type SubscriptionTier = "starter" | "pro" | "business";
export type SubscriptionStatus = "trialing" | "active" | "past_due" | "canceled" | "incomplete";

export interface Subscription {
  tier: SubscriptionTier;
  status: SubscriptionStatus;
  billing_interval: "month" | "year";
  included_seats: number;
  paid_seats: number;
  total_seats: number;
  trial_ends_at: string | null;
  current_period_end: string | null;
  cancel_at_period_end: boolean;
  is_active: boolean;
  asset_limit: number | null;
  work_order_limit: number | null;
}

export async function getCompanySubscription(): Promise<Subscription | null> {
  const { data, error } = await supabase.rpc("get_company_subscription");
  if (error) throw error;
  const row = Array.isArray(data) ? data[0] : data;
  return (row as Subscription) ?? null;
}
