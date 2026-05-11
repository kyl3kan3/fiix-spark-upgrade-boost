
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

export const useWorkOrderFormData = () => {
  const { toast } = useToast();

  const { data: assets, isLoading: isLoadingAssets } = useQuery({
    queryKey: ["assets"],
    queryFn: async () => {
      const { data, error } = await supabase.from("assets").select("*").order("name");
      if (error) throw error;
      return data || [];
    },
  });

  const { data: technicians, isLoading: isLoadingTechnicians } = useQuery({
    queryKey: ["technicians"],
    queryFn: async () => {
      const { data, error } = await (supabase as any).rpc("get_company_directory");
      if (error) throw error;
      const sorted = (data || []).slice().sort((a: any, b: any) =>
        (a.first_name || "").localeCompare(b.first_name || "")
      );
      return sorted;
    },
  });

  return {
    assets,
    technicians,
    isLoading: isLoadingAssets || isLoadingTechnicians,
  };
};
