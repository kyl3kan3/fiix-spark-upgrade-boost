import { Check, X, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * Flat-fee pricing advantage section.
 *
 * Most CMMS competitors (UpKeep, MaintainX, Limble, eMaint, Fiix) charge
 * per-user. MaintenEase charges a flat monthly fee. For a crew of 8 techs the
 * cost gap is 3-4x — and this is the single strongest reason to choose us.
 *
 * The previous homepage buried this story below the fold and only showed
 * absolute prices. This section makes the comparison explicit so a CMMS
 * evaluator sees it in 5 seconds.
 *
 * Numbers are based on publicly listed competitor pricing as of 2026-Q2 and
 * are illustrative — review periodically and update if competitor pricing
 * shifts.
 */

const competitors = [
  { name: "UpKeep", perUser: 45, label: "Starter" },
  { name: "MaintainX", perUser: 21, label: "Essential" },
  { name: "Limble", perUser: 28, label: "Standard" },
  { name: "Fiix", perUser: 45, label: "Basic" },
];

const TEAM_SIZE = 8; // illustrative crew used for the comparison
const MAINTENEASE_PRO = 129;

const FlatFeeAdvantage = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-card border-y border-border">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
            Flat-fee pricing
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-4">
            Stop paying per technician.
          </h2>
          <p className="text-lg text-muted-foreground">
            Every other CMMS charges by the seat. We don't. Add the whole
            crew, scale your team, and pay one flat price.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-xl border border-border bg-background overflow-hidden shadow-sm">
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
                  MaintenEase Pro
                </div>
                <div className="text-xs text-muted-foreground">
                  Flat monthly fee
                </div>
              </div>
            </div>
            <div className="px-6 py-5 border-b border-border text-foreground">
              ${MAINTENEASE_PRO}/mo flat
            </div>
            <div className="px-6 py-5 border-b border-border font-bold text-primary text-lg">
              ${MAINTENEASE_PRO}/mo
            </div>

            {competitors.map((c) => {
              const total = c.perUser * TEAM_SIZE;
              const savings = total - MAINTENEASE_PRO;
              return (
                <div key={c.name} className="contents">
                  <div className="px-6 py-5 border-b border-border last:border-b-0 flex items-center gap-3">
                    <X className="h-5 w-5 text-muted-foreground shrink-0" />
                    <div>
                      <div className="font-medium text-foreground">{c.name}</div>
                      <div className="text-xs text-muted-foreground">
                        {c.label} • per-user
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-5 border-b border-border last:border-b-0 text-foreground">
                    ${c.perUser}/user/mo
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
                  </div>
                </div>
              );
            })}
          </div>

          <div className="px-6 py-4 bg-muted/50 text-xs text-muted-foreground border-t border-border">
            Competitor pricing reflects publicly listed entry/standard tiers as
            of 2026 and is shown for comparison only. Per-user plans typically
            require annual commitment; MaintenEase is month-to-month.
          </div>
        </div>

        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            size="lg"
            className="bg-primary text-primary-foreground hover:bg-primary-variant px-8 group uppercase tracking-wide shadow-md hover:-translate-y-0.5 transition-all"
            onClick={() => navigate("/auth?signup=true")}
          >
            Start your 14-day trial
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
      </div>
    </section>
  );
};

export default FlatFeeAdvantage;
