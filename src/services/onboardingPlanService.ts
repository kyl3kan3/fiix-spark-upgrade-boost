import { supabase } from "@/integrations/supabase/client";
import type { Json } from "@/integrations/supabase/types";
import { toast } from "sonner";
import { requireUserCompany } from "@/services/supabaseHelpers";
import {
  buildOnboardingPlan,
  type GoalKey,
  type OnboardingAnswers,
  type OnboardingPlan,
} from "@/lib/onboardingPlan";

export interface OnboardingProfile {
  goals: GoalKey[];
  industry: string | null;
  teamSize: string | null;
  plan: OnboardingPlan;
  completedAt: string | null;
}

/** Fetch the company's guided-setup profile, or null if they haven't done it. */
export const fetchOnboardingProfile = async (): Promise<OnboardingProfile | null> => {
  const { data, error } = await supabase
    .from("onboarding_profiles")
    .select("goals, industry, team_size, plan, completed_at")
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    goals: (data.goals ?? []) as GoalKey[],
    industry: data.industry,
    teamSize: data.team_size,
    plan: (data.plan ?? {}) as unknown as OnboardingPlan,
    completedAt: data.completed_at,
  };
};

/** Generate a plan from the answers and upsert the company's profile. Returns the plan. */
export const saveOnboardingProfile = async (answers: OnboardingAnswers): Promise<OnboardingPlan> => {
  try {
    const { companyId } = await requireUserCompany();
    const plan = buildOnboardingPlan(answers);
    const { error } = await supabase.from("onboarding_profiles").upsert(
      {
        company_id: companyId,
        goals: answers.goals,
        industry: answers.industry ?? null,
        team_size: answers.teamSize ?? null,
        plan: plan as unknown as Json,
        completed_at: new Date().toISOString(),
      },
      { onConflict: "company_id" },
    );
    if (error) throw error;
    toast.success("Your setup plan is ready");
    return plan;
  } catch (error) {
    console.error("Error saving onboarding profile:", error);
    toast.error("Couldn't save your setup plan");
    throw error;
  }
};
