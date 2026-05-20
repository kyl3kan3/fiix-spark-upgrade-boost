import { useQuery } from "@tanstack/react-query";
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

export const TIER_FEATURES: Record<SubscriptionTier, { analytics: boolean; automations: boolean; api: boolean; sso: boolean }> = {
 starter: { analytics: false, automations: false, api: false, sso: false },
 pro: { analytics: true, automations: true, api: false, sso: false },
 business: { analytics: true, automations: true, api: true, sso: true },
};

export function useSubscription() {
 return useQuery({
 queryKey: ["subscription"],
 queryFn: async (): Promise<Subscription | null> => {
 const { data, error } = await supabase.rpc("get_company_subscription");
 if (error) throw error;
 const row = Array.isArray(data) ? data[0] : data;
 return (row as Subscription) ?? null;
 },
 staleTime: 60_000,
 });
}

export function useHasFeature(feature: keyof typeof TIER_FEATURES["starter"]) {
 const { data } = useSubscription();
 if (!data) return false;
 if (!data.is_active) return false;
 return TIER_FEATURES[data.tier][feature];
}