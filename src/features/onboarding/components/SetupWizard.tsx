import React, { useState } from "react";
import { Check, Sparkles } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  GOALS,
  TEAM_SIZES,
  type GoalKey,
  type OnboardingAnswers,
} from "@/lib/onboardingPlan";

interface Props {
  initial?: Partial<OnboardingAnswers>;
  isSaving: boolean;
  onSubmit: (answers: OnboardingAnswers) => void;
}

const SetupWizard: React.FC<Props> = ({ initial, isSaving, onSubmit }) => {
  const [goals, setGoals] = useState<GoalKey[]>(initial?.goals ?? []);
  const [industry, setIndustry] = useState(initial?.industry ?? "");
  const [teamSize, setTeamSize] = useState(initial?.teamSize ?? "");

  const toggleGoal = (key: GoalKey) =>
    setGoals((prev) => (prev.includes(key) ? prev.filter((g) => g !== key) : [...prev, key]));

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Tell us what matters most</CardTitle>
        <p className="text-sm text-muted-foreground">
          Pick your goals and we'll tailor a starter plan — which tools to use first and a setup checklist.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <Label>What are you here to do? (pick any)</Label>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {GOALS.map((g) => {
              const selected = goals.includes(g.key);
              return (
                <button
                  key={g.key}
                  type="button"
                  onClick={() => toggleGoal(g.key)}
                  className={`text-left rounded-lg border p-3 transition-colors ${
                    selected ? "border-primary bg-primary/5" : "border-border hover:border-primary/40"
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm">{g.label}</span>
                    {selected && <Check className="h-4 w-4 text-primary" />}
                  </div>
                  <p className="text-xs text-muted-foreground mt-0.5">{g.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="setup-industry">Industry (optional)</Label>
            <Input
              id="setup-industry"
              value={industry}
              onChange={(e) => setIndustry(e.target.value)}
              placeholder="e.g. Manufacturing"
            />
          </div>
          <div className="space-y-2">
            <Label>Team size (optional)</Label>
            <Select value={teamSize} onValueChange={setTeamSize}>
              <SelectTrigger aria-label="Team size">
                <SelectValue placeholder="Select a size" />
              </SelectTrigger>
              <SelectContent>
                {TEAM_SIZES.map((s) => (
                  <SelectItem key={s} value={s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex justify-end">
          <Button
            onClick={() => onSubmit({ goals, industry: industry.trim() || null, teamSize: teamSize || null })}
            disabled={isSaving}
          >
            <Sparkles className="h-4 w-4 mr-2" />
            {isSaving ? "Building your plan…" : "Generate my plan"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default SetupWizard;
