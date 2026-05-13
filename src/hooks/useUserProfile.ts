
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getCurrentUser } from "@/services/supabaseHelpers";

export const useUserProfile = () => {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      const user = await getCurrentUser();
      if (!user) return null;

      const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single();

      return profile;
    },
  });

  return { profile, isLoading, error };
};
