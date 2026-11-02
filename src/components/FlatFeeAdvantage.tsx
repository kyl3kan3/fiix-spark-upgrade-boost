import { Check, X } from "lucide-react";
import Reveal3D from "@/components/marketing/Reveal3D";
import MarketingPrimaryCta from "@/components/marketing/MarketingPrimaryCta";
import { pricedComparisons, TEAM_SIZE } from "@/data/comparisons";
import { getMaintenEaseTeamPrice } from "@/data/productCatalog";

const FlatFeeAdvantage = () => {
  const maintenease = getMaintenEaseTeamPrice(TEAM_SIZE);

  return (
    <section className="py-20 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-12 text-center max-w-3xl mx-auto">
          Team of {TEAM_SIZE}: monthly cost
        </h2>

        <Reveal3D className="max-w-4xl mx-auto">
          <div className="rounded-xl border border-border bg-background overflow-hidden shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-[1.2fr_1fr_1fr] text-sm">
              <div className="bg-muted px-6 py-4 font-semibold text-foreground border-b border-border">
                Vendor
              </div>
              <div className="hidden sm:block bg-muted px-6 py-4 font-semibold text-foreground border-b border-border">
                Listed price
              </div>
              <div className="hidden sm:block bg-muted px-6 py-4 font-semibold text-foreground border-b border-border">
                Monthly cost
              </div>

              <div className="px-6 py-5 border-b border-border flex items-center gap-3 bg-primary/5">
                <Check className="h-5 w-5 text-primary shrink-0" />
                <div className="font-semibold text-foreground">
                  MaintenEase {maintenease.plan.name}
                </div>
              </div>
              <div className="px-6 py-5 border-b border-border text-foreground">
                ${maintenease.plan.monthlyPrice}/mo + seats
              </div>
              <div className="px-6 py-5 border-b border-border font-bold text-primary text-lg">
                ${maintenease.monthlyPrice}/mo
              </div>

              {pricedComparisons.map((c) => {
                const total = c.competitorPricePerUser * TEAM_SIZE;
                return (
                  <div key={c.competitor} className="contents">
                    <div className="px-6 py-5 border-b border-border last:border-b-0 flex items-center gap-3">
                      <X className="h-5 w-5 text-muted-foreground shrink-0" />
                      <div className="font-medium text-foreground">{c.competitor}</div>
                    </div>
                    <div className="px-6 py-5 border-b border-border last:border-b-0 text-foreground">
                      ${c.competitorPricePerUser}/user/mo
                    </div>
                    <div className="px-6 py-5 border-b border-border last:border-b-0 font-semibold text-foreground">
                      ${total}/mo
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal3D>

        <div className="mt-10 flex justify-center">
          <MarketingPrimaryCta />
        </div>
      </div>
    </section>
  );
};

export default FlatFeeAdvantage;
