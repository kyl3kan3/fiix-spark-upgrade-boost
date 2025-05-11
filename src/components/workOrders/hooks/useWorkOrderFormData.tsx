
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
      const { data, error } = await supabase.from("profiles").select("*").order("first_name");
      if (error) throw error;
      return data || [];
    },
  });

  return {
    assets,
    technicians,
    isLoading: isLoadingAssets || isLoadingTechnicians,
  };
};
