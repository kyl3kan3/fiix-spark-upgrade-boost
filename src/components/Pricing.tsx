import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Reveal3D from "@/components/marketing/Reveal3D";
import { PRODUCT_PLANS } from "@/data/productCatalog";
import { SIGNUP_PATH } from "@/data/signupRoute";

const Pricing = () => {
  const navigate = useNavigate();
  return (
    <section id="plans" className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-primary mb-12 text-center">
          Pricing
        </h2>

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
                <h3 className={`text-xl font-bold font-headline ${plan.popular ? "text-primary-foreground" : "text-primary"}`}>
                  {plan.name}
                </h3>
                <div className="mb-6 mt-4 pb-6 border-b border-current/10">
                  <span className={`text-4xl font-bold ${plan.popular ? "text-primary-foreground" : "text-foreground"}`}>
                    ${plan.monthlyPrice}
                  </span>
                  <span className={plan.popular ? "text-primary-foreground/70" : "text-muted-foreground"}>/mo</span>
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
                      ? "w-full bg-primary-foreground text-primary hover:bg-primary-foreground/90 font-semibold"
                      : "w-full border-primary text-primary hover:bg-primary/5 font-semibold"
                  }
                  variant={plan.popular ? "default" : "outline"}
                  onClick={() => navigate(SIGNUP_PATH)}
                >
                  Start free trial
                </Button>
              </div>
            </Reveal3D>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Pricing;
