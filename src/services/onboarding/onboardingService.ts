import { supabase } from "@/integrations/supabase/client";

export type OnboardingTaskKey =
  | "first_location"
  | "first_asset"
  | "first_vendor"
  | "first_work_order"
  | "invited_teammate";

export interface OnboardingProgress {
  id: string;
  user_id: string;
  company_id: string;
  wizard_step: number;
  wizard_complete: boolean;
  tour_complete: boolean;
  checklist_dismissed: boolean;
  tasks_completed: Partial<Record<OnboardingTaskKey, boolean>>;
  created_at: string;
  updated_at: string;
}

export async function fetchOnboardingProgress(
  userId: string,
  companyId: string
): Promise<OnboardingProgress | null> {
  const { data, error } = await supabase
    .from("onboarding_progress")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("fetchOnboardingProgress error", error);
    return null;
  }

  if (!data) {
    const { data: created, error: insertErr } = await supabase
      .from("onboarding_progress")
      .insert({ user_id: userId, company_id: companyId })
      .select("*")
      .single();
    if (insertErr) {
      console.error("create onboarding_progress error", insertErr);
      return null;
    }
    return created as unknown as OnboardingProgress;
  }

  return data as unknown as OnboardingProgress;
}

export async function updateOnboardingProgress(
  userId: string,
  patch: Partial<Omit<OnboardingProgress, "id" | "user_id" | "company_id" | "created_at" | "updated_at">>
): Promise<void> {
  const { error } = await supabase
    .from("onboarding_progress")
    .update(patch)
    .eq("user_id", userId);
  if (error) console.error("updateOnboardingProgress error", error);
}