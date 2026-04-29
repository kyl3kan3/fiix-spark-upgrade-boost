import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/auth";
import { useOnboardingProgress } from "./useOnboardingProgress";

/**
 * Watches the user's company data and flips task flags as each is satisfied.
 */
export function useTaskAutoComplete() {
  const { user } = useAuth();
  const { progress, markTask } = useOnboardingProgress();

  const companyId = progress?.company_id;

  const { data: counts } = useQuery({
    queryKey: ["onboarding_counts", companyId, user?.id],
    enabled: !!companyId && !!user?.id,
    refetchInterval: 30_000,
    queryFn: async () => {
      if (!companyId || !user?.id) return null;
      const [loc, asset, vendor, wo, profiles] = await Promise.all([
        supabase.from("locations").select("id", { count: "exact", head: true }).eq("company_id", companyId),
        supabase.from("assets").select("id", { count: "exact", head: true }).eq("company_id", companyId),
        supabase.from("vendors").select("id", { count: "exact", head: true }).eq("company_id", companyId),
        supabase.from("work_orders").select("id", { count: "exact", head: true }).eq("created_by", user.id),
        supabase.from("profiles").select("id", { count: "exact", head: true }).eq("company_id", companyId),
      ]);
      return {
        locations: loc.count ?? 0,
        assets: asset.count ?? 0,
        vendors: vendor.count ?? 0,
        workOrders: wo.count ?? 0,
        teamSize: profiles.count ?? 0,
      };
    },
  });

  useEffect(() => {
    if (!counts || !progress) return;
    if (counts.locations > 0) markTask("first_location");
    if (counts.assets > 0) markTask("first_asset");
    if (counts.vendors > 0) markTask("first_vendor");
    if (counts.workOrders > 0) markTask("first_work_order");
    if (counts.teamSize > 1) markTask("invited_teammate");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [counts, progress?.id]);

  return counts;
}