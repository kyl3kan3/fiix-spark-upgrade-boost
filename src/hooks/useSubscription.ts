import { useQuery } from "@tanstack/react-query";
import { getCompanySubscription, type SubscriptionTier } from "@/services/subscriptionService";
import { PLAN_BY_TIER } from "@/data/productCatalog";

export type { SubscriptionTier, SubscriptionStatus, Subscription } from "@/services/subscriptionService";

export const TIER_FEATURES: Record<
  SubscriptionTier,
  {
    analytics: boolean;
    automations: boolean;
    api: boolean;
    sso: boolean;
    predictive_maintenance: boolean;
    lubricant_tracking: boolean;
    parts_inventory: boolean;
    meter_based_pm: boolean;
    bulk_pm_generation: boolean;
  }
> = {
  starter: {
    analytics: PLAN_BY_TIER.starter.capabilities.analytics,
    automations: PLAN_BY_TIER.starter.capabilities.automations,
    api: PLAN_BY_TIER.starter.capabilities.api,
    sso: PLAN_BY_TIER.starter.capabilities.sso,
    predictive_maintenance: PLAN_BY_TIER.starter.capabilities.predictiveMaintenance,
    lubricant_tracking: PLAN_BY_TIER.starter.capabilities.lubricantTracking,
    parts_inventory: PLAN_BY_TIER.starter.capabilities.partsInventory,
    meter_based_pm: PLAN_BY_TIER.starter.capabilities.meterBasedPm,
    bulk_pm_generation: PLAN_BY_TIER.starter.capabilities.bulkPmGeneration,
  },
  pro: {
    analytics: PLAN_BY_TIER.pro.capabilities.analytics,
    automations: PLAN_BY_TIER.pro.capabilities.automations,
    api: PLAN_BY_TIER.pro.capabilities.api,
    sso: PLAN_BY_TIER.pro.capabilities.sso,
    predictive_maintenance: PLAN_BY_TIER.pro.capabilities.predictiveMaintenance,
    lubricant_tracking: PLAN_BY_TIER.pro.capabilities.lubricantTracking,
    parts_inventory: PLAN_BY_TIER.pro.capabilities.partsInventory,
    meter_based_pm: PLAN_BY_TIER.pro.capabilities.meterBasedPm,
    bulk_pm_generation: PLAN_BY_TIER.pro.capabilities.bulkPmGeneration,
  },
  business: {
    analytics: PLAN_BY_TIER.business.capabilities.analytics,
    automations: PLAN_BY_TIER.business.capabilities.automations,
    api: PLAN_BY_TIER.business.capabilities.api,
    sso: PLAN_BY_TIER.business.capabilities.sso,
    predictive_maintenance: PLAN_BY_TIER.business.capabilities.predictiveMaintenance,
    lubricant_tracking: PLAN_BY_TIER.business.capabilities.lubricantTracking,
    parts_inventory: PLAN_BY_TIER.business.capabilities.partsInventory,
    meter_based_pm: PLAN_BY_TIER.business.capabilities.meterBasedPm,
    bulk_pm_generation: PLAN_BY_TIER.business.capabilities.bulkPmGeneration,
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
