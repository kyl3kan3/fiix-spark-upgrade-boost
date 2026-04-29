import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchOnboardingProgress,
  updateOnboardingProgress,
  OnboardingProgress,
  OnboardingTaskKey,
} from "@/services/onboarding/onboardingService";

export function useOnboardingProgress() {
  const { user, isAuthenticated } = useAuth();
  const qc = useQueryClient();

  const { data: progress, isLoading } = useQuery({
    queryKey: ["onboarding_progress", user?.id],
    enabled: !!user?.id && isAuthenticated,
    queryFn: async (): Promise<OnboardingProgress | null> => {
      if (!user?.id) return null;
      const { data: profile } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .maybeSingle();
      if (!profile?.company_id) return null;
      return fetchOnboardingProgress(user.id, profile.company_id);
    },
  });

  const mutation = useMutation({
    mutationFn: async (
      patch: Partial<
        Omit<OnboardingProgress, "id" | "user_id" | "company_id" | "created_at" | "updated_at">
      >
    ) => {
      if (!user?.id) return;
      await updateOnboardingProgress(user.id, patch);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["onboarding_progress", user?.id] }),
  });

  const markTask = (key: OnboardingTaskKey) => {
    if (!progress) return;
    if (progress.tasks_completed?.[key]) return;
    mutation.mutate({
      tasks_completed: { ...(progress.tasks_completed || {}), [key]: true },
    });
  };

  const setWizardStep = (step: number) => mutation.mutate({ wizard_step: step });
  const completeWizard = () => mutation.mutate({ wizard_complete: true });
  const completeTour = () => mutation.mutate({ tour_complete: true });
  const restartTour = () => mutation.mutate({ tour_complete: false });
  const restartWizard = () => mutation.mutate({ wizard_step: 0, wizard_complete: false });
  const dismissChecklist = () => mutation.mutate({ checklist_dismissed: true });
  const showChecklist = () => mutation.mutate({ checklist_dismissed: false });

  return {
    progress,
    isLoading,
    markTask,
    setWizardStep,
    completeWizard,
    completeTour,
    restartTour,
    restartWizard,
    dismissChecklist,
    showChecklist,
  };
}