import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { getCheckoutUserContext } from "@/services/billingService";
import { toast } from "sonner";
import ShareButtons from "@/components/marketing/ShareButtons";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { PaymentTestModeBanner } from "@/components/billing/PaymentTestModeBanner";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { TRIAL_DAYS } from "@/constants/trial";
import { trackTrialEvent } from "@/lib/analytics/trialEvents";

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
  void trackTrialEvent("trial_checkout_started", { tier, metadata: { interval } });
 const checkoutUser = await getCheckoutUserContext();
 if (!checkoutUser) {
 navigate("/auth?signup=true");
 return;
 }
 const { userId, email, companyId } = checkoutUser;
 if (!companyId) {
 toast.error("Finish setting up your company before subscribing.");
 return;
 }
 const priceId = `${tier}_${interval === "month" ? "monthly" : "yearly"}`;
 await openCheckout({
 priceId,
 customerEmail: email,
 customData: { companyId, userId },
	  successUrl: `${window.location.origin}/billing?success=1`,
 	  trialDays: TRIAL_DAYS,
	});
 } catch (e) {
 toast.error((e as Error).message || "Could not start checkout");
 } finally {
 setLoadingTier(null);
 }
 }

 return (
 <MarketingLayout>
 <Helmet>
 <title>Pricing — Plans for Maintenance Teams | MaintenEase</title>
 <meta name="description" content="Simple per-team pricing for MaintenEase. Compare Starter, Pro, and Business plans for asset tracking, work orders, and inspections. 7-day free trial." />
 <link rel="canonical" href="https://maintenease.com/pricing" />
 <meta property="og:title" content="MaintenEase Pricing — Plans for Maintenance Teams" />
 <meta property="og:description" content="Compare Starter, Pro, and Business plans. 7-day free trial." />
 <meta property="og:url" content="https://maintenease.com/pricing" />
 <meta property="og:type" content="website" />
 <meta property="og:image" content="https://maintenease.com/og-image.png?v=2" />
 <meta name="twitter:card" content="summary_large_image" />
 <meta name="twitter:title" content="MaintenEase Pricing — Plans for Maintenance Teams" />
 <meta name="twitter:description" content="Compare Starter, Pro, and Business plans. 7-day free trial." />
 <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=2" />
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

 {/* Hero section */}
 <section className="pt-16 pb-12 px-4 text-center bg-background border-b border-border">
   <div className="max-w-2xl mx-auto">
     <h1 className="font-headline text-4xl md:text-5xl font-bold text-primary mb-4 tracking-tight">
       Simple, transparent pricing
     </h1>
     <p className="text-lg text-muted-foreground mb-8">
        Choose the plan that fits your facility's needs. 7-day free trial on every plan.
     </p>
     <div className="inline-flex items-center bg-muted rounded-full p-1 border border-border shadow-sm">
       <span
         className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
           interval === "month" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-primary"
         }`}
         onClick={() => setInterval("month")}
       >
         Monthly
       </span>
       <Switch
         checked={interval === "year"}
         onCheckedChange={(c) => setInterval(c ? "year" : "month")}
         className="mx-1"
       />
       <span
         className={`px-5 py-2 rounded-full text-sm font-semibold transition-all cursor-pointer ${
           interval === "year" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-primary"
         }`}
         onClick={() => setInterval("year")}
       >
         Annual <span className="text-success text-xs ml-1">-17%</span>
       </span>
     </div>
   </div>
 </section>

 <div className="container mx-auto max-w-6xl px-4 py-12">
 <div className="grid gap-6 md:grid-cols-3 items-center mb-10">
 {PLANS.map((plan) => {
 const price = interval === "month" ? plan.monthly : Math.round(plan.yearly / 12);
 return (
 <Card
   key={plan.tier}
   className={`relative transition-all duration-300 hover:-translate-y-1 ${
     plan.popular
       ? "border-primary shadow-xl md:-translate-y-2 bg-primary text-primary-foreground"
       : "border-border shadow-sm hover:border-primary/20 hover:shadow-md"
   }`}
 >
   {plan.popular && (
     <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-bold px-4 py-1 rounded-full uppercase tracking-wide shadow-md">
       Most popular
     </div>
   )}
 <CardHeader>
 <div className="flex items-center justify-between">
   <CardTitle className={`font-headline text-xl ${plan.popular ? "text-primary-foreground" : "text-primary"}`}>
     {plan.name}
   </CardTitle>
   {plan.popular && <Badge className="bg-secondary text-secondary-foreground">Best Value</Badge>}
 </div>
 <p className={`text-sm ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>{plan.blurb}</p>
 <div className="mt-4 pb-4 border-b border-current/10">
   <span className={`text-4xl font-bold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>${price}</span>
   <span className={plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}>/mo</span>
   {interval === "year" && (
     <div className={`text-xs mt-1 ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
       billed ${plan.yearly}/year
     </div>
   )}
 </div>
 </CardHeader>
 <CardContent className="space-y-4">
 <Button
   className={
     plan.popular
       ? "w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold uppercase tracking-wide"
       : "w-full bg-primary text-primary-foreground hover:bg-primary-variant font-semibold uppercase tracking-wide shadow-sm"
   }
   disabled={loadingTier === plan.tier}
   onClick={() => startCheckout(plan.tier)}
 >
 {loadingTier === plan.tier ? "Loading…" : "Start 7-day trial"}
 </Button>
 <ul className="space-y-2 text-sm">
 {plan.features.map((f) => (
 <li key={f} className="flex items-start gap-2">
   <CheckCircle2 className={`mt-0.5 h-4 w-4 shrink-0 ${plan.popular ? "text-primary-foreground" : "text-primary"}`} />
   <span className={plan.popular ? "text-primary-foreground" : "text-foreground"}>{f}</span>
 </li>
 ))}
 </ul>
 </CardContent>
 </Card>
 );
 })}
 </div>

 <p className="mt-4 text-center text-sm text-muted-foreground">
 All plans include unlimited locations, asset images, and mobile access. Card required to start trial; cancel before day 8 to avoid charges.
 </p>
 <div className="mt-10 flex flex-col items-center gap-3 border-t border-border pt-8 sm:flex-row sm:justify-between">
 <p className="text-sm text-muted-foreground">Share these plans</p>
 <ShareButtons
 url="https://maintenease.com/pricing"
 title="MaintenEase Pricing — Plans for Maintenance Teams"
 description="Compare Starter, Pro, and Business plans. 7-day free trial."
 />
 </div>
 </div>
 </MarketingLayout>
 );
}