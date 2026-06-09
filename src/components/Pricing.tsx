import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "$49",
    period: "/mo",
    description: "For small teams getting organized.",
    features: [
      "2 included seats",
      "Up to 50 assets",
      "100 work orders/mo",
      "Mobile app access",
      "Email support",
    ],
    cta: "Start free trial",
    highlight: false,
  },
  {
    name: "Pro",
    price: "$129",
    period: "/mo",
    description: "Most popular for growing maintenance teams.",
    features: [
      "4 included seats",
      "Up to 500 assets",
      "2,000 work orders/mo",
      "Full analytics & reports",
      "Automations",
      "Priority support",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Business",
    price: "$299",
    period: "/mo",
    description: "For larger organizations.",
    features: [
      "Everything in Pro",
      "Unlimited assets & work orders",
      "$15/extra seat/mo",
      "Automations + API",
      "SSO",
      "Email + chat support",
    ],
    cta: "Start free trial",
    highlight: false,
  },
];

// Keep these claims consistent with PricingPage.tsx and the Stripe checkout
// flow. The trial requires a card and auto-converts to paid on day 15 unless
// cancelled — say so plainly here instead of contradicting the pricing page.
const comparison = [
  "7-day free trial on every plan",
  "Card required — cancel before day 8, no charge",
  "Cancel or change plans anytime",
  "Free onboarding & data import",
];

const Pricing = () => {
  const navigate = useNavigate();
  return (
    <section id="plans" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-4">
            Simple pricing for every team
          </h2>
          <p className="text-lg text-muted-foreground">
            Choose the plan that fits your operation. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto items-center">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-xl border bg-card p-8 flex flex-col transition-all duration-300 hover:-translate-y-1 ${
                plan.highlight
                  ? "border-primary shadow-xl md:-translate-y-2 bg-primary text-primary-foreground"
                  : "border-border shadow-sm hover:border-primary/20 hover:shadow-md"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 uppercase tracking-wide shadow-md">
                  <Sparkles className="h-3 w-3" /> Best Value
                </div>
              )}
              <h3 className={`text-xl font-bold font-headline ${plan.highlight ? "text-primary-foreground" : "text-primary"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mt-1 mb-6 ${plan.highlight ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {plan.description}
              </p>
              <div className="mb-6 pb-6 border-b border-current/10">
                <span className={`text-4xl font-bold ${plan.highlight ? "text-primary-foreground" : "text-foreground"}`}>
                  {plan.price}
                </span>
                <span className={plan.highlight ? "text-primary-foreground/70" : "text-muted-foreground"}>
                  {plan.period}
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${plan.highlight ? "text-primary-foreground" : "text-foreground"}`}>
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${plan.highlight ? "text-primary-foreground" : "text-primary"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={
                  plan.highlight
                    ? "w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold uppercase tracking-wide"
                    : "w-full border-primary text-primary hover:bg-primary/5 font-semibold uppercase tracking-wide"
                }
                variant={plan.highlight ? "default" : "outline"}
                onClick={() => navigate("/auth?signup=true")}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 max-w-3xl mx-auto rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center font-headline">
            Every plan includes
          </h3>
          <ul className="grid sm:grid-cols-2 gap-3">
            {comparison.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-primary shrink-0" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
};

export default Pricing;