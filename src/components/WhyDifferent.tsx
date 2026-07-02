import { ArrowRight, BadgeDollarSign, Brain, Rocket, CalendarOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Reveal3D from "@/components/marketing/Reveal3D";

/**
 * Concise "what makes us different" section.
 *
 * FlatFeeAdvantage makes the pricing case with a full comparison table; this
 * section answers the broader evaluator question — "why you and not UpKeep /
 * MaintainX / Limble / Fiix?" — in four scannable claims that go beyond price.
 * Keep the claims consistent with Pricing.tsx and the compare pages.
 */

const differentiators = [
  {
    icon: BadgeDollarSign,
    title: "One flat price",
    detail:
      "Every major CMMS charges per technician. MaintenEase starts at $49/mo flat — add the whole crew without the bill growing.",
  },
  {
    icon: Brain,
    title: "Predictive maintenance built in",
    detail:
      "Failure-risk scoring on Pro and Business plans — not an enterprise add-on with a sales call attached.",
  },
  {
    icon: Rocket,
    title: "Live in days, not months",
    detail:
      "Free onboarding and data import on every plan. Your asset list and open work orders come with you.",
  },
  {
    icon: CalendarOff,
    title: "Month-to-month, always",
    detail:
      "No annual contract to sign and no penalty to leave. We keep your business by being useful, not by locking you in.",
  },
];

const WhyDifferent = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-4">
            How MaintenEase is different
          </h2>
          <p className="text-lg text-muted-foreground">
            Same category as UpKeep, MaintainX, Limble, and Fiix — a very
            different deal.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
          {differentiators.map((d, index) => (
            <Reveal3D key={d.title} delayMs={(index % 2) * 120} className="h-full">
              <div className="h-full rounded-xl border border-border bg-card p-6 flex gap-4">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <d.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-1.5">{d.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{d.detail}</p>
              </div>
              </div>
            </Reveal3D>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => navigate("/compare")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            See side-by-side comparisons
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default WhyDifferent;
