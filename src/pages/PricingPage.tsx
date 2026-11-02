import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link, useNavigate } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { createCheckoutContext } from "@/services/billingService";
import { toast } from "sonner";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import { usePaddleCheckout } from "@/hooks/usePaddleCheckout";
import { PaymentTestModeBanner } from "@/components/billing/PaymentTestModeBanner";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import MarketingPageHeader from "@/components/marketing/MarketingPageHeader";
import { TRIAL_DAYS } from "@/constants/trial";
import { trackTrialEvent } from "@/lib/analytics/trialEvents";
import { getPaddleEnvironment } from "@/lib/paddle";
import {
 PRODUCT_PLANS,
 PRODUCT_JSON_LD,
} from "@/data/productCatalog";

export default function PricingPage() {
 const [interval, setInterval] = useState<"month" | "year">("month");
 const [loadingTier, setLoadingTier] = useState<string | null>(null);
 const navigate = useNavigate();
 const { openCheckout } = usePaddleCheckout();

 async function startCheckout(tier: "starter" | "pro" | "business") {
 setLoadingTier(tier);
 try {
  void trackTrialEvent("trial_checkout_started", { tier, metadata: { interval } });
 const checkoutContext = await createCheckoutContext(getPaddleEnvironment());
 if (!checkoutContext) {
 navigate("/auth?signup=true");
 return;
 }
 const { checkoutAuthorizationId, email } = checkoutContext;
 const priceId = `${tier}_${interval === "month" ? "monthly" : "yearly"}`;
 await openCheckout({
 priceId,
 customerEmail: email,
 customData: { checkoutAuthorizationId },
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
 <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
 <meta name="twitter:card" content="summary_large_image" />
 <meta name="twitter:title" content="MaintenEase Pricing — Plans for Maintenance Teams" />
 <meta name="twitter:description" content="Compare Starter, Pro, and Business plans. 7-day free trial." />
 <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
 <script type="application/ld+json">{JSON.stringify(PRODUCT_JSON_LD)}</script>
 </Helmet>
 <MarketingJsonLd />
 <PaymentTestModeBanner />

 <MarketingPageHeader title="Pricing" />

 <section className="px-4 pb-8 text-center">
   <div className="inline-flex items-center bg-muted rounded-full p-1 border border-border shadow-sm">
     <button
       type="button"
       className={`px-4 md:px-5 py-2 rounded-full text-sm font-semibold transition-ui ${
         interval === "month" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-primary"
       }`}
       onClick={() => setInterval("month")}
     >
       Monthly
     </button>
     <Switch
       checked={interval === "year"}
       onCheckedChange={(c) => setInterval(c ? "year" : "month")}
       className="mx-1"
       aria-label="Toggle annual billing"
     />
     <button
       type="button"
       className={`px-4 md:px-5 py-2 rounded-full text-sm font-semibold transition-ui ${
         interval === "year" ? "bg-background shadow text-primary" : "text-muted-foreground hover:text-primary"
       }`}
       onClick={() => setInterval("year")}
     >
       Annual
     </button>
   </div>
 </section>

 <div className="container mx-auto max-w-6xl px-4 py-8 pb-16">
 <div className="grid gap-6 md:grid-cols-3 items-center">
 {PRODUCT_PLANS.map((plan) => {
 const price = interval === "month" ? plan.monthlyPrice : Math.round(plan.annualPrice / 12);
 return (
 <Card
   key={plan.tier}
   id={`plan-${plan.tier}`}
   className={`relative transition-ui duration-300 hover:-translate-y-1 ${
     plan.popular
       ? "border-primary shadow-xl md:-translate-y-2 bg-primary text-primary-foreground"
       : "border-border shadow-sm hover:border-primary/20 hover:shadow-md"
   }`}
 >
 <CardHeader>
 <CardTitle className={`font-headline text-xl ${plan.popular ? "text-primary-foreground" : "text-primary"}`}>
   {plan.name}
 </CardTitle>
 <div className="mt-4 pb-4 border-b border-current/10">
   <span className={`text-4xl font-bold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>${price}</span>
   <span className={plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}>/mo</span>
   {interval === "year" && (
     <div className={`text-xs mt-1 ${plan.popular ? "text-primary-foreground/60" : "text-muted-foreground"}`}>
       ${plan.annualPrice}/year
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
 {plan.featureLabels.map((f) => (
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

 <nav className="mt-12 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm">
   <Link to="/compare/maintenease-vs-upkeep" className="text-primary underline underline-offset-4">UpKeep</Link>
   <Link to="/compare/maintenease-vs-emaint" className="text-primary underline underline-offset-4">eMaint</Link>
   <Link to="/compare/maintenease-vs-maintainx" className="text-primary underline underline-offset-4">MaintainX</Link>
   <Link to="/cmms-cost-calculator" className="text-primary underline underline-offset-4">Cost calculator</Link>
 </nav>
 </div>
 </MarketingLayout>
 );
}
