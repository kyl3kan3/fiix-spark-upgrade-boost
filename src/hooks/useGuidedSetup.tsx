import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  fetchOnboardingProfile,
  saveOnboardingProfile,
} from "@/services/onboardingPlanService";

const PROFILE_KEY = ["guided-setup", "profile"] as const;

export function useGuidedSetup() {
  const queryClient = useQueryClient();

  const {
    data: profile = null,
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: PROFILE_KEY,
    queryFn: fetchOnboardingProfile,
  });

  const save = useMutation({
    mutationFn: saveOnboardingProfile,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["guided-setup"] }),
  });

  return { profile, isLoading, error: (error as Error) ?? null, refetch, save };
}
