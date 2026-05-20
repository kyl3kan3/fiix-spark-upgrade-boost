import { useState } from "react";
import { Helmet } from "react-helmet";
import { Link, useNavigate } from "react-router-dom";
import { Check, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import ShareButtons from "@/components/marketing/ShareButtons";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { PaymentTestModeBanner } from "@/components/billing/PaymentTestModeBanner";

const PLANS = [
  {
    tier: "starter" as const,
    name: "Starter",
    monthly: 49,
    yearly: 490,
    blurb: "For small teams getting started",
    features: ["2 included seats", "Up to 50 assets", "100 work orders/mo", "Basic dashboard", "Email support"],
  },
  {
    tier: "pro" as const,
    name: "Pro",
    monthly: 129,
    yearly: 1290,
    blurb: "For growing maintenance teams",
    popular: true,
    features: ["4 included seats", "Up to 500 assets", "2,000 work orders/mo", "Full analytics & reports", "Automations", "Priority email support"],
  },
  {
    tier: "business" as const,
    name: "Business",
    monthly: 299,
    yearly: 2990,
    blurb: "For larger organizations",
    features: ["4 included seats", "$15/extra seat/mo", "Unlimited assets", "Unlimited work orders", "Full analytics & exports", "Automations + API", "SSO", "Email + chat support"],
  },
];

export default function PricingPage() {
  const [interval, setInterval] = useState<"month" | "year">("month");
  const [loadingTier, setLoadingTier] = useState<string | null>(null);
  const navigate = useNavigate();
  const { openCheckout } = usePaddleCheckout();

  async function startCheckout(tier: "starter" | "pro" | "business") {
    setLoadingTier(tier);
    try {
      const { data: session } = await supabase.auth.getSession();
      if (!session.session) {
        navigate("/auth?signup=true");
        return;
      }
      const userId = session.session.user.id;
      const email = session.session.user.email ?? undefined;
      const { data: profile } = await supabase
        .from("profiles").select("company_id").eq("id", userId).maybeSingle();
      if (!profile?.company_id) {
        toast.error("Finish setting up your company before subscribing.");
        return;
      }
      const priceId = `${tier}_${interval === "month" ? "monthly" : "yearly"}`;
      await openCheckout({
        priceId,
        customerEmail: email,
        customData: { companyId: profile.company_id, userId },
        successUrl: `${window.location.origin}/billing?success=1`,
        trialDays: 14,
      });
    } catch (e) {
      toast.error((e as Error).message || "Could not start checkout");
    } finally {
      setLoadingTier(null);
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Pricing — Plans for Maintenance Teams | MaintenEase</title>
        <meta name="description" content="Simple per-team pricing for MaintenEase. Compare Starter, Pro, and Business plans for asset tracking, work orders, and inspections. 14-day free trial." />
        <link rel="canonical" href="https://maintenease.com/pricing" />
        <meta property="og:title" content="MaintenEase Pricing — Plans for Maintenance Teams" />
        <meta property="og:description" content="Compare Starter, Pro, and Business plans. 14-day free trial." />
        <meta property="og:url" content="https://maintenease.com/pricing" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://maintenease.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MaintenEase Pricing — Plans for Maintenance Teams" />
        <meta name="twitter:description" content="Compare Starter, Pro, and Business plans. 14-day free trial." />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "MaintenEase",
          description: "Maintenance management software for asset tracking, work orders, and inspections.",
          brand: { "@type": "Brand", name: "MaintenEase" },
          offers: [
            { "@type": "Offer", name: "Starter", price: "49", priceCurrency: "USD" },
            { "@type": "Offer", name: "Pro", price: "129", priceCurrency: "USD" },
            { "@type": "Offer", name: "Business", price: "299", priceCurrency: "USD" }
          ]
        })}</script>
      </Helmet>
      <MarketingJsonLd />
      <PaymentTestModeBanner />
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
                  <Button className="w-full" disabled={loadingTier === plan.tier} onClick={() => startCheckout(plan.tier)}>
                    {loadingTier === plan.tier ? "Loading…" : "Start 14-day trial"}
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
        <div className="mt-10 flex flex-col items-center gap-3 border-t pt-8 sm:flex-row sm:justify-between">
          <p className="text-sm text-muted-foreground">Share these plans</p>
          <ShareButtons
            url="https://maintenease.com/pricing"
            title="MaintenEase Pricing — Plans for Maintenance Teams"
            description="Compare Starter, Pro, and Business plans. 14-day free trial."
          />
        </div>
      </div>
    </div>
  );
}