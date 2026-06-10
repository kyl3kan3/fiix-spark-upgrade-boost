
import { useQuery } from "@tanstack/react-query";
import { getCurrentUserProfile } from "@/services/profile";

export const useUserProfile = () => {
  const { data: profile, isLoading, error } = useQuery({
    queryKey: ["userProfile"],
    queryFn: getCurrentUserProfile,
  });

  return { profile, isLoading, error };
};
