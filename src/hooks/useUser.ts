
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/services/supabaseHelpers";

export const useUser = () => {
  const { data: user, isLoading, error } = useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });

  return { user, isLoading, error };
};
