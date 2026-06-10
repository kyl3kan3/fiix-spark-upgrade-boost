import { useQuery } from "@tanstack/react-query";
import { getCompanySubscription, type SubscriptionTier } from "@/services/subscriptionService";

export type { SubscriptionTier, SubscriptionStatus, Subscription } from "@/services/subscriptionService";

export const TIER_FEATURES: Record<SubscriptionTier, { analytics: boolean; automations: boolean; api: boolean; sso: boolean }> = {
  starter: { analytics: false, automations: false, api: false, sso: false },
  pro: { analytics: true, automations: true, api: false, sso: false },
  business: { analytics: true, automations: true, api: true, sso: true },
};

export function useSubscription() {
  return useQuery({
    queryKey: ["subscription"],
    queryFn: getCompanySubscription,
    staleTime: 60_000,
  });
}

export function useHasFeature(feature: keyof typeof TIER_FEATURES["starter"]) {
  const { data } = useSubscription();
  if (!data) return false;
  if (!data.is_active) return false;
  return TIER_FEATURES[data.tier][feature];
}
