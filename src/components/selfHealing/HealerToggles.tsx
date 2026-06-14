import React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Activity, Wrench, Database, Sparkles } from "lucide-react";
import type { SelfHealingSettings } from "@/services/selfHealingService";

interface Props {
  settings: SelfHealingSettings | null;
  onChange: (updates: Partial<Omit<SelfHealingSettings, "company_id">>) => void;
  disabled?: boolean;
}

const HEALERS = [
  {
    key: "risk_scoring_enabled" as const,
    icon: Activity,
    title: "Risk-scoring auto-remediation",
    desc: "Retries failed predictive-maintenance runs and surfaces persistent failures.",
  },
  {
    key: "work_orders_enabled" as const,
    icon: Wrench,
    title: "Stuck & orphaned work orders",
    desc: "Flags stalled jobs and reassigns work orders whose assignee left the company.",
  },
  {
    key: "data_integrity_enabled" as const,
    icon: Database,
    title: "Data integrity sweep",
    desc: "Cleans up orphaned records, missing roles, and unscoped data.",
  },
  {
    key: "ai_triage_enabled" as const,
    icon: Sparkles,
    title: "AI request triage",
    desc: "Uses Lovable AI to score new public requests for urgency & category.",
  },
];

export default function HealerToggles({ settings, onChange, disabled }: Props) {
  const val = (key: keyof Omit<SelfHealingSettings, "company_id">) =>
    settings ? settings[key] : true;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Healers</CardTitle>
        <CardDescription>
          Turn individual self-healing routines on or off for your tenant.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {HEALERS.map(({ key, icon: Icon, title, desc }) => (
          <div key={key} className="flex items-start justify-between gap-4 border-b last:border-0 pb-4 last:pb-0">
            <div className="flex gap-3 min-w-0">
              <div className="rounded-md bg-muted p-2 h-fit">
                <Icon className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <Label htmlFor={key} className="text-sm font-medium block">{title}</Label>
                <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
              </div>
            </div>
            <Switch
              id={key}
              checked={val(key)}
              disabled={disabled}
              onCheckedChange={(checked) => onChange({ [key]: checked })}
            />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}