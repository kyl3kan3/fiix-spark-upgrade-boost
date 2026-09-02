import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import Reveal3D from "@/components/marketing/Reveal3D";
import { pricedComparisons, TEAM_SIZE } from "@/data/comparisons";
import { getMaintenEaseTeamPrice } from "@/data/productCatalog";

/**
 * Account-plan pricing comparison section.
 *
 * CMMS competitors with a current public per-user price are compared here.
 * Quote-only vendors are kept on their detailed comparison pages and excluded
 * from calculator math. MaintenEase publishes account plans with included
 * seats and a Business extra-seat price so the comparison can use actual cost.
 *
 * The previous homepage buried this story below the fold and only showed
 * absolute prices. This section makes the comparison explicit so a CMMS
 * evaluator sees it in 5 seconds.
 *
 * Numbers are based on publicly listed competitor pricing as of 2026-Q2 and
 * are illustrative — review periodically and update if competitor pricing
 * shifts.
 */

const FlatFeeAdvantage = () => {
  const navigate = useNavigate();
  const maintenease = getMaintenEaseTeamPrice(TEAM_SIZE);

  return (
    <section className="py-20 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
            Published account pricing
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-4">
            Compare the bill for your actual crew.
          </h2>
          <p className="text-lg text-muted-foreground">
            MaintenEase plans include seats up front. For teams above four,
            Business adds seats at a published $15 per month each.
          </p>
        </div>

        <Reveal3D className="max-w-4xl mx-auto">
        <div className="rounded-xl border border-border bg-background overflow-hidden shadow-sm">
          <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_1fr] text-sm">
            <div className="bg-muted px-6 py-4 font-semibold text-foreground border-b border-border">
              For a team of {TEAM_SIZE} technicians
            </div>
            <div className="hidden sm:block bg-muted px-6 py-4 font-semibold text-foreground border-b border-border">
              Listed price
            </div>
            <div className="hidden sm:block bg-muted px-6 py-4 font-semibold text-foreground border-b border-border">
              Monthly cost
            </div>

            <div className="px-6 py-5 border-b border-border flex items-center gap-3 bg-primary/5">
              <Check className="h-5 w-5 text-primary shrink-0" />
              <div>
                <div className="font-semibold text-foreground">
                  MaintenEase {maintenease.plan.name}
                </div>
                <div className="text-xs text-muted-foreground">
                  {maintenease.plan.includedSeats} seats included + {maintenease.extraSeats} extra
                </div>
              </div>
            </div>
            <div className="px-6 py-5 border-b border-border text-foreground">
              ${maintenease.plan.monthlyPrice}/mo + ${maintenease.extraSeats * 15}/mo seats
            </div>
            <div className="px-6 py-5 border-b border-border font-bold text-primary text-lg">
              ${maintenease.monthlyPrice}/mo
            </div>

            {pricedComparisons.map((c) => {
              const total = c.competitorPricePerUser * TEAM_SIZE;
              const savings = total - maintenease.monthlyPrice;
              return (
                <div key={c.competitor} className="contents">
                  <div className="px-6 py-5 border-b border-border last:border-b-0 flex items-center gap-3">
                    <X className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">{c.competitor}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.competitorPlan} • per-user
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-5 border-b border-border last:border-b-0 text-foreground">
                    ${c.competitorPricePerUser}/user/mo
                  </div>
                  <div className="px-6 py-5 border-b border-border last:border-b-0">
                    <div className="font-semibold text-foreground">
                      ${total}/mo
                    </div>
                    {savings > 0 && (
                      <div className="text-xs text-secondary font-medium">
                        You save ${savings}/mo
                      </div>
                    )}
                    {savings < 0 && (
                      <div className="text-xs text-muted-foreground font-medium">
                        {c.competitor} is ${Math.abs(savings)}/mo less at this team size
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 bg-muted/50 text-xs text-muted-foreground border-t border-border">
            MaintenEase estimate uses the lowest published plan that covers {TEAM_SIZE} seats;
            asset or work-order volume may require a higher plan. Competitor pricing reflects
            publicly listed entry/standard tiers as of 2026 and must be verified with each vendor.
          </div>
        </div>
        </Reveal3D>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary-variant px-8 group uppercase tracking-wide shadow-md hover:-translate-y-0.5 transition-ui"
            onClick={() => navigate("/auth?signup=true")}
          >
            Start free trial
            <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="border-primary/20 text-primary hover:bg-primary/5"
            onClick={() => navigate("/pricing")}
          >
            See full pricing
          </Button>
        </div>
        <p className="mt-6 text-center text-sm text-muted-foreground">
          <button onClick={() => navigate("/compare")} className="font-medium text-primary hover:underline">
            Compare MaintenEase to UpKeep, Fiix, MaintainX &amp; Limble →
          </button>
          <span className="mx-2 text-border">|</span>
          <button onClick={() => navigate("/cmms-cost-calculator")} className="font-medium text-primary hover:underline">
            Run the numbers for your team size →
          </button>
        </p>
      </div>
    </section>
  );
};

export default FlatFeeAdvantage;
