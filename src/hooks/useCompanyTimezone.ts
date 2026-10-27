import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { requireUserCompany } from "@/services/supabaseHelpers";

export function useCompanyTimezone() {
  return useQuery({
    queryKey: ["company-timezone"],
    queryFn: async () => {
      const { companyId } = await requireUserCompany();
      const { data, error } = await supabase
        .from("companies")
        .select("timezone")
        .eq("id", companyId)
        .maybeSingle();
      if (error) throw error;
      return data?.timezone?.trim() || "UTC";
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function formatInCompanyTimezone(iso: string, timeZone: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      timeZone,
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}
