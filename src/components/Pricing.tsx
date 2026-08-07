import { Button } from "@/components/ui/button";
import { Check, Sparkles } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Reveal3D from "@/components/marketing/Reveal3D";
import { COMMON_PLAN_FACTS, PRODUCT_PLANS } from "@/data/productCatalog";

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
          {PRODUCT_PLANS.map((plan, index) => (
            <Reveal3D key={plan.name} delayMs={index * 120}>
            <div
              className={`relative rounded-xl border bg-card p-8 flex flex-col transition-ui duration-300 hover:-translate-y-1 ${
                plan.popular
                  ? "border-primary shadow-xl md:-translate-y-2 bg-primary text-primary-foreground"
                  : "border-border shadow-sm hover:border-primary/20 hover:shadow-md"
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-secondary text-secondary-foreground text-xs font-bold px-4 py-1 rounded-full flex items-center gap-1 uppercase tracking-wide shadow-md">
                  <Sparkles className="h-3 w-3" /> Best Value
                </div>
              )}
              <h3 className={`text-xl font-bold font-headline ${plan.popular ? "text-primary-foreground" : "text-primary"}`}>
                {plan.name}
              </h3>
              <p className={`text-sm mt-1 mb-6 ${plan.popular ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                {plan.description}
              </p>
              <div className="mb-6 pb-6 border-b border-current/10">
                <span className={`text-4xl font-bold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                  ${plan.monthlyPrice}
                </span>
                <span className={plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}>
                  /mo
                </span>
              </div>
              <ul className="space-y-3 mb-8 flex-1">
                {plan.featureLabels.map((f) => (
                  <li key={f} className={`flex items-start gap-2 text-sm ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                    <Check className={`h-4 w-4 mt-0.5 shrink-0 ${plan.popular ? "text-primary-foreground" : "text-primary"}`} />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <Button
                className={
                  plan.popular
                    ? "w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold uppercase tracking-wide"
                    : "w-full border-primary text-primary hover:bg-primary/5 font-semibold uppercase tracking-wide"
                }
                variant={plan.popular ? "default" : "outline"}
                onClick={() => navigate("/auth?signup=true")}
              >
                Start free trial
              </Button>
            </div>
            </Reveal3D>
          ))}
        </div>

        <div className="mt-12 max-w-3xl mx-auto rounded-xl border border-border bg-card p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-foreground mb-4 text-center font-headline">
            Every plan includes
          </h3>
          <ul className="grid sm:grid-cols-2 gap-3">
            {COMMON_PLAN_FACTS.map((item) => (
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
