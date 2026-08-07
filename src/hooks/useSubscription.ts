import { useQuery } from "@tanstack/react-query";
import { getCompanySubscription, type SubscriptionTier } from "@/services/subscriptionService";
import { PLAN_BY_TIER } from "@/data/productCatalog";

export type { SubscriptionTier, SubscriptionStatus, Subscription } from "@/services/subscriptionService";

export const TIER_FEATURES: Record<SubscriptionTier, { analytics: boolean; automations: boolean; api: boolean; sso: boolean; predictive_maintenance: boolean }> = {
  starter: {
    analytics: PLAN_BY_TIER.starter.capabilities.analytics,
    automations: PLAN_BY_TIER.starter.capabilities.automations,
    api: PLAN_BY_TIER.starter.capabilities.api,
    sso: PLAN_BY_TIER.starter.capabilities.sso,
    predictive_maintenance: PLAN_BY_TIER.starter.capabilities.predictiveMaintenance,
  },
  pro: {
    analytics: PLAN_BY_TIER.pro.capabilities.analytics,
    automations: PLAN_BY_TIER.pro.capabilities.automations,
    api: PLAN_BY_TIER.pro.capabilities.api,
    sso: PLAN_BY_TIER.pro.capabilities.sso,
    predictive_maintenance: PLAN_BY_TIER.pro.capabilities.predictiveMaintenance,
  },
  business: {
    analytics: PLAN_BY_TIER.business.capabilities.analytics,
    automations: PLAN_BY_TIER.business.capabilities.automations,
    api: PLAN_BY_TIER.business.capabilities.api,
    sso: PLAN_BY_TIER.business.capabilities.sso,
    predictive_maintenance: PLAN_BY_TIER.business.capabilities.predictiveMaintenance,
  },
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
  // An unknown tier value from the backend must degrade to "no feature",
  // not crash the shell with a property read on undefined.
  return TIER_FEATURES[data.tier]?.[feature] ?? false;
}
