import { BadgeDollarSign, Brain, Rocket, CalendarOff } from "lucide-react";
import Reveal3D from "@/components/marketing/Reveal3D";

const differentiators = [
  { icon: BadgeDollarSign, title: "Predictable account plans" },
  { icon: Brain, title: "Predictive maintenance on Pro & Business" },
  { icon: Rocket, title: "Onboarding & import included" },
  { icon: CalendarOff, title: "Monthly or annual billing" },
];

const WhyDifferent = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
        How MaintenEase is different
      </h2>

      <div className="grid sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
        {differentiators.map((d, index) => (
          <Reveal3D key={d.title} delayMs={(index % 2) * 120} className="h-full">
            <div className="h-full rounded-xl border border-border bg-card p-6 flex gap-4 items-center">
              <div className="w-11 h-11 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                <d.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground">{d.title}</h3>
            </div>
          </Reveal3D>
        ))}
      </div>
    </div>
  </section>
);

export default WhyDifferent;
