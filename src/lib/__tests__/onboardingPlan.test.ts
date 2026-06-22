import { describe, it, expect } from "vitest";
import { buildOnboardingPlan, GOALS } from "@/lib/onboardingPlan";

describe("onboardingPlan.buildOnboardingPlan", () => {
  it("prioritizes modules matching the selected goals", () => {
    const plan = buildOnboardingPlan({ goals: ["control_costs"] });
    expect(plan.modules[0].id).toBe("costs");
    // Cost-related modules should appear; unrelated single-purpose ones should not lead.
    expect(plan.modules.map((m) => m.id)).toContain("power"); // power also serves control_costs
  });

  it("ranks predictive maintenance first for downtime + preventive goals", () => {
    const plan = buildOnboardingPlan({ goals: ["reduce_downtime", "go_preventive"] });
    expect(plan.modules[0].id).toBe("predictive");
  });

  it("only includes goal-relevant modules when goals are set", () => {
    const plan = buildOnboardingPlan({ goals: ["track_energy"] });
    const ids = plan.modules.map((m) => m.id);
    expect(ids).toContain("power");
    expect(ids).not.toContain("assistant");
  });

  it("falls back to baseline modules when no goals are chosen", () => {
    const plan = buildOnboardingPlan({ goals: [] });
    expect(plan.modules.length).toBeGreaterThan(0);
    expect(plan.headline).toMatch(/starting point/i);
  });

  it("always includes the core setup tasks plus goal-specific ones, de-duplicated", () => {
    const plan = buildOnboardingPlan({ goals: ["control_costs", "track_energy"] });
    const ids = plan.tasks.map((t) => t.id);
    expect(ids).toContain("add-asset");
    expect(ids).toContain("invite-team");
    expect(ids).toContain("log-cost");
    expect(ids).toContain("log-energy");
    expect(new Set(ids).size).toBe(ids.length); // no duplicates
  });

  it("caps recommendations at five", () => {
    const plan = buildOnboardingPlan({ goals: GOALS.map((g) => g.key) });
    expect(plan.modules.length).toBeLessThanOrEqual(5);
  });
});
