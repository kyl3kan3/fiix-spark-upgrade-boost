import React from "react";
import { Link } from "react-router-dom";
import {
  BrainCircuit,
  Wallet,
  Gauge,
  Package,
  FileStack,
  Bot,
  CalendarClock,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  RotateCcw,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { OnboardingPlan } from "@/lib/onboardingPlan";

const ICONS: Record<string, React.ElementType> = {
  BrainCircuit,
  Wallet,
  Gauge,
  Package,
  FileStack,
  Bot,
  CalendarClock,
};

interface Props {
  plan: OnboardingPlan;
  onRedo: () => void;
}

const PersonalizedPlan: React.FC<Props> = ({ plan, onRedo }) => {
  const assistantPrompt = encodeURIComponent("Help me get started based on my setup plan.");
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-muted-foreground">Your personalized plan</p>
          <h2 className="text-xl font-semibold">{plan.headline}</h2>
        </div>
        <Button variant="outline" size="sm" onClick={onRedo}>
          <RotateCcw className="h-4 w-4 mr-2" />
          Redo setup
        </Button>
      </div>

      <div>
        <h3 className="text-sm font-medium text-muted-foreground mb-3">Recommended for you</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {plan.modules.map((m) => {
            const Icon = ICONS[m.icon] ?? Sparkles;
            return (
              <Card key={m.id} className="hover:border-primary/50 transition-colors">
                <CardContent className="p-4 flex items-start gap-3">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-medium">{m.title}</p>
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{m.reason}</p>
                    <Button asChild variant="link" className="h-auto p-0 mt-2">
                      <Link to={m.href}>
                        Open <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Setup checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {plan.tasks.map((t) => (
                <li key={t.id}>
                  <Link
                    to={t.href}
                    className="flex items-center gap-3 rounded-md p-2 hover:bg-muted transition-colors"
                  >
                    <CheckCircle2 className="h-4 w-4 text-muted-foreground shrink-0" />
                    <span className="text-sm flex-1">{t.label}</span>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </Link>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>

        <Card className="bg-primary/5 border-primary/30">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-primary" />
              <p className="font-medium">Need a hand?</p>
            </div>
            <p className="text-sm text-muted-foreground">
              Ask the assistant to walk you through your plan or draft your first work orders.
            </p>
            <Button asChild size="sm">
              <Link to={`/assistant?prompt=${assistantPrompt}`}>Ask the assistant</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default PersonalizedPlan;
