import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { PRODUCT_PLANS } from "@/data/productCatalog";

/**
 * Homepage pricing snapshot — full plan details live on /pricing.
 */
const HomePricingSummary = () => (
  <section id="plans" className="border-y border-border bg-background py-16">
    <div className="container mx-auto max-w-4xl px-4 text-center">
      <h2 className="font-headline text-3xl font-bold text-foreground md:text-4xl">Account pricing from $49/mo</h2>
      <p className="mx-auto mt-4 max-w-2xl text-muted-foreground">
        Flat account plans with included seats. Every plan includes a 7-day trial, free onboarding, and data import.
      </p>
      <ul className="mt-10 grid gap-4 text-left sm:grid-cols-3">
        {PRODUCT_PLANS.map((plan) => (
          <li key={plan.tier} className="rounded-xl border border-border bg-card p-5">
            <h3 className="font-headline text-lg font-semibold text-foreground">{plan.name}</h3>
            <p className="mt-2 text-3xl font-bold text-primary">
              ${plan.monthlyPrice}
              <span className="text-base font-normal text-muted-foreground">/mo</span>
            </p>
            <p className="mt-2 text-sm text-muted-foreground">{plan.includedSeats} included seats</p>
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <Button asChild size="lg" className="font-semibold">
          <Link to="/pricing">See full pricing and limits</Link>
        </Button>
        <Button asChild variant="outline" size="lg">
          <Link to="/cmms-cost-calculator">CMMS cost calculator</Link>
        </Button>
      </div>
    </div>
  </section>
);

export default HomePricingSummary;