import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";

const plans = [
  {
    name: "Starter",
    price: "$29",
    period: "/user/mo",
    description: "For small teams getting organized.",
    features: [
      "Up to 5 users",
      "250 assets",
      "Work orders & PMs",
      "Mobile app access",
      "Email support",
    ],
    cta: "Start free trial",
    highlight: false,
  },
  {
    name: "Professional",
    price: "$59",
    period: "/user/mo",
    description: "Most popular for growing maintenance teams.",
    features: [
      "Unlimited users",
      "Unlimited assets",
      "Inspections & checklists",
      "Request portal",
      "Reporting & analytics",
      "Priority support",
    ],
    cta: "Start free trial",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "$89",
    period: "/user/mo",
    description: "For complex, multi-site operations.",
    features: [
      "Everything in Professional",
      "Custom integrations",
      "SSO & advanced roles",
      "Dedicated success manager",
      "24/7 premium support",
    ],
    cta: "Contact sales",
    highlight: false,
  },
];

const comparison = [
  "14-day free trial on every plan",
  "No credit card required to start",
  "Cancel or change plans anytime",
  "Free onboarding & data import",
];

const Pricing = () => {
  const navigate = useNavigate();
  return (
    <section id="plans" className="py-20 bg-fiix-50/40">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Simple pricing for every team
          </h2>
          <p className="text-lg text-foreground">
            Choose the plan that fits your operation. Upgrade or downgrade anytime.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl border bg-card p-8 flex flex-col ${
                plan.highlight
                  ? "border-fiix-600 shadow-xl ring-2 ring-fiix-600/20 md:-translate-y-2"
                  : "border-border shadow-sm"
              }`}
            >
              {plan.highlight && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-fiix-600 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1">
                  <Sparkles className="h-3 w-3" /> Most popular
                </div>
              )}
              <h3 className="text-xl font-bold text-foreground">{plan.name}</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-6">{plan.description}</p>
              <div className="mb-6">
                <span className="text-4xl font-bold text-foreground">{plan.price}</span>
                <span className="text-muted-foreground">{plan.period}</span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                    <Check className="h-4 w-4 text-fiix-600 mt-0.5 shrink-0" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={
                  plan.highlight
                    ? "w-full bg-fiix-600 hover:bg-fiix-700 text-white"
                    : "w-full"
                }
                variant={plan.highlight ? "default" : "outline"}
                onClick={() => navigate("/auth?signup=true")}
              >
                {plan.cta}
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-12 max-w-3xl mx-auto rounded-xl border border-border bg-card p-6">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center">
            Every plan includes
          </h3>
          <ul className="grid sm:grid-cols-2 gap-3">
            {comparison.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="h-4 w-4 text-fiix-600 shrink-0" />
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