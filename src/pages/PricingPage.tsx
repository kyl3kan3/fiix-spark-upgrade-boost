import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MaterialIcon from "@/components/ui/material-icon";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
    blurb: "Essential tools for small facilities and teams.",
    features: ["Up to 5 Users", "Basic Work Order Management", "Asset Register (Up to 500)", "Standard Reporting"],
    popular: false,
  },
  {
    tier: "pro" as const,
    name: "Professional",
    monthly: 99,
    yearly: 990,
    blurb: "Advanced features for growing operations.",
    popular: true,
    features: ["Unlimited Users", "Preventative Maintenance", "Inventory Tracking", "API Access & Integrations", "Priority Support"],
  },
  {
    tier: "business" as const,
    name: "Enterprise",
    monthly: null,
    yearly: null,
    blurb: "Custom solutions for large-scale operations.",
    features: ["Everything in Professional", "Multi-site Management", "Custom Workflows", "Dedicated Success Manager", "SSO & Advanced Security"],
    popular: false,
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
    <div className="min-h-screen bg-background antialiased font-body-md flex flex-col">
      <Helmet>
        <title>Pricing — Plans for Maintenance Teams | MaintenEase</title>
        <meta name="description" content="Simple per-team pricing for MaintenEase. Compare Starter, Professional, and Enterprise plans for asset tracking, work orders, and inspections. 14-day free trial." />
        <link rel="canonical" href="https://maintenease.com/pricing" />
        <meta property="og:title" content="MaintenEase Pricing — Plans for Maintenance Teams" />
        <meta property="og:description" content="Compare Starter, Professional, and Enterprise plans. 14-day free trial." />
        <meta property="og:url" content="https://maintenease.com/pricing" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://maintenease.com/og-image.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MaintenEase Pricing — Plans for Maintenance Teams" />
        <meta name="twitter:description" content="Compare Starter, Professional, and Enterprise plans. 14-day free trial." />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png" />
        <script type="application/ld+json">{JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "MaintenEase",
          description: "Maintenance management software for asset tracking, work orders, and inspections.",
          brand: { "@type": "Brand", name: "MaintenEase" },
          offers: [
            { "@type": "Offer", name: "Starter", price: "49", priceCurrency: "USD" },
            { "@type": "Offer", name: "Professional", price: "99", priceCurrency: "USD" },
            { "@type": "Offer", name: "Enterprise", price: "0", priceCurrency: "USD" }
          ]
        })}</script>
      </Helmet>
      <MarketingJsonLd />
      <PaymentTestModeBanner />
      <Navbar />

      <main className="flex-grow pb-24">
        {/* Hero Section */}
        <section className="pt-20 pb-16 px-container_padding max-w-7xl mx-auto text-center">
          <h1 className="font-display-lg text-display-lg md:text-[56px] text-primary mb-6">Simple, transparent pricing</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl mx-auto mb-10">Choose the plan that fits your facility's needs. Upgrade anytime as your operations grow.</p>
          <div className="inline-flex items-center bg-surface-container-low rounded-full p-1 border border-outline-variant/30 shadow-sm">
            <button
              className={`px-6 py-2 rounded-full font-label-md text-label-md transition-colors ${interval === "month" ? "bg-primary text-on-primary shadow" : "text-on-surface-variant hover:text-primary"}`}
              onClick={() => setInterval("month")}
            >
              Monthly
            </button>
            <button
              className={`px-6 py-2 rounded-full font-label-md text-label-md transition-colors ${interval === "year" ? "bg-primary text-on-primary shadow" : "text-on-surface-variant hover:text-primary"}`}
              onClick={() => setInterval("year")}
            >
              Annually <span className="text-success text-xs ml-1">-20%</span>
            </button>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="px-container_padding max-w-7xl mx-auto mb-24 relative">
          {/* Decorative background element */}
          <div className="absolute inset-0 bg-gradient-to-b from-surface-container-high/30 to-transparent -z-10 rounded-3xl" style={{ top: '10%' }}></div>
          <div className="grid md:grid-cols-3 gap-8 items-center">
            {PLANS.map((plan) => {
              const price = plan.monthly === null ? null : interval === "month" ? plan.monthly : Math.round((plan.yearly ?? 0) / 12);
              return (
                <div
                  key={plan.tier}
                  className={`rounded-xl p-card_padding border transition-all duration-300 ${
                    plan.popular
                      ? "bg-primary-container border-primary shadow-[0_20px_40px_rgba(0,0,0,0.08)] relative transform scale-105 z-10"
                      : "bg-surface border-outline-variant/30 shadow-sm hover:shadow-lg hover:border-primary/20 hover:-translate-y-1"
                  }`}
                >
                  {plan.popular && (
                    <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-surface-tint text-on-primary px-4 py-1 rounded-full font-label-sm text-label-sm uppercase tracking-wider shadow-md">
                      Best Value
                    </div>
                  )}
                  <h3 className={`font-headline-md text-headline-md mb-2 ${plan.popular ? "text-on-primary-container" : "text-primary"}`}>
                    {plan.name}
                  </h3>
                  <p className={`font-body-md text-body-md mb-6 h-12 ${plan.popular ? "text-inverse-on-surface/80" : "text-on-surface-variant"}`}>
                    {plan.blurb}
                  </p>
                  <div className={`mb-8 pb-6 ${plan.popular ? "border-b border-on-primary-container/20" : "border-b border-outline-variant/20"}`}>
                    {price !== null ? (
                      <>
                        <span className={`text-4xl font-bold font-display-lg ${plan.popular ? "text-on-primary" : "text-on-surface"}`}>
                          ${price}
                        </span>
                        <span className={`font-body-md text-body-md ${plan.popular ? "text-inverse-on-surface/80" : "text-on-surface-variant"}`}>
                          /user/mo
                        </span>
                      </>
                    ) : (
                      <span className="text-4xl font-bold font-display-lg text-on-surface">Custom</span>
                    )}
                  </div>
                  <ul className="space-y-4 mb-8">
                    {plan.features.map((f) => (
                      <li key={f} className={`flex items-start gap-3 font-body-md text-body-md ${plan.popular ? "text-on-primary" : "text-on-surface"}`}>
                        <MaterialIcon
                          name="check_circle"
                          className={`text-[20px] ${plan.popular ? "text-on-primary-container" : "text-primary"}`}
                        />
                        {f}
                      </li>
                    ))}
                  </ul>
                  {plan.tier === "business" ? (
                    <button
                      className="w-full py-3 rounded-lg border-2 border-primary text-primary font-label-md text-label-md hover:bg-primary/5 transition-colors"
                      onClick={() => navigate("/auth?signup=true")}
                    >
                      Contact Sales
                    </button>
                  ) : plan.popular ? (
                    <button
                      className="w-full py-3 rounded-lg bg-on-primary-container text-on-primary font-label-md text-label-md hover:bg-surface-tint transition-colors shadow-md"
                      disabled={loadingTier === plan.tier}
                      onClick={() => startCheckout(plan.tier)}
                    >
                      {loadingTier === plan.tier ? "Loading…" : "Get Professional"}
                    </button>
                  ) : (
                    <button
                      className="w-full py-3 rounded-lg border-2 border-primary text-primary font-label-md text-label-md hover:bg-primary/5 transition-colors"
                      disabled={loadingTier === plan.tier}
                      onClick={() => startCheckout(plan.tier)}
                    >
                      {loadingTier === plan.tier ? "Loading…" : "Start Free Trial"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>

          <p className="mt-8 text-center font-label-sm text-label-sm text-on-surface-variant">
            All plans include unlimited locations, asset images, and mobile access. Card required to start trial; cancel before day 15 to avoid charges.
          </p>
          <div className="mt-8 flex flex-col items-center gap-3 border-t border-outline-variant/30 pt-6 sm:flex-row sm:justify-between">
            <p className="font-label-sm text-label-sm text-on-surface-variant">Share these plans</p>
            <ShareButtons
              url="https://maintenease.com/pricing"
              title="MaintenEase Pricing — Plans for Maintenance Teams"
              description="Compare Starter, Professional, and Enterprise plans. 14-day free trial."
            />
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
