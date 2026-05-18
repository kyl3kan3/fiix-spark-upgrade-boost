import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const PLANS = [
  {
    tier: "starter" as const,
    name: "Starter",
    monthly: 29,
    yearly: 290,
    seat: 10,
    blurb: "For small teams getting started",
    features: ["2 included seats", "$10/extra seat/mo", "Up to 50 assets", "100 work orders/mo", "Basic dashboard", "Email support"],
  },
  {
    tier: "pro" as const,
    name: "Pro",
    monthly: 79,
    yearly: 790,
    seat: 12,
    blurb: "For growing maintenance teams",
    popular: true,
    features: ["4 included seats", "$12/extra seat/mo", "Up to 500 assets", "2,000 work orders/mo", "Full analytics & reports", "Automations", "Priority email support"],
  },
  {
    tier: "business" as const,
    name: "Business",
    monthly: 199,
    yearly: 1990,
    seat: 15,
    blurb: "For larger organizations",
    features: ["4 included seats", "$15/extra seat/mo", "Unlimited assets", "Unlimited work orders", "Full analytics & exports", "Automations + API", "SSO", "Email + chat support"],
  },
];

export default function PricingPage() {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [loading, setLoading] = useState<string | null>(null);
  const navigate = useNavigate();

  async function startCheckout(tier: "starter" | "pro" | "business") {
    setLoading(tier);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate("/auth?signup=true");
        return;
      }
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: { tier, interval },
      });
      if (error) throw error;
      if (data?.url) window.location.href = data.url;
    } catch (e) {
      toast.error((e as Error).message || "Could not start checkout");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto max-w-6xl px-4 py-12">
        <Button asChild variant="ghost" size="sm" className="mb-6">
          <Link to="/dashboard"><ArrowLeft className="mr-2 h-4 w-4" />Back to Dashboard</Link>
        </Button>

        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight">Simple, transparent pricing</h1>
          <p className="mt-3 text-lg text-muted-foreground">14-day free trial on every plan. Cancel anytime.</p>

          <div className="mt-6 inline-flex items-center gap-3 rounded-full border bg-card px-4 py-2">
            <span className={interval === "month" ? "font-medium" : "text-muted-foreground"}>Monthly</span>
            <Switch checked={interval === "year"} onCheckedChange={(c) => setInterval(c ? "year" : "month")} />
            <span className={interval === "year" ? "font-medium" : "text-muted-foreground"}>Annual</span>
            <Badge variant="secondary">Save ~17%</Badge>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {PLANS.map((plan) => {
            const price = interval === "month" ? plan.monthly : Math.round(plan.yearly / 12);
            return (
              <Card key={plan.tier} className={plan.popular ? "border-primary shadow-lg" : ""}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{plan.name}</CardTitle>
                    {plan.popular && <Badge>Most popular</Badge>}
                  </div>
                  <p className="text-sm text-muted-foreground">{plan.blurb}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">${price}</span>
                    <span className="text-muted-foreground">/mo</span>
                    {interval === "year" && (
                      <div className="text-xs text-muted-foreground">billed ${plan.yearly}/year</div>
                    )}
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <Button className="w-full" disabled={loading === plan.tier} onClick={() => startCheckout(plan.tier)}>
                    {loading === plan.tier ? "Loading…" : "Start 14-day trial"}
                  </Button>
                  <ul className="space-y-2 text-sm">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <p className="mt-10 text-center text-sm text-muted-foreground">
          All plans include unlimited locations, asset images, and mobile access. Card required to start trial; cancel before day 15 to avoid charges.
        </p>
      </div>
    </div>
  );
}