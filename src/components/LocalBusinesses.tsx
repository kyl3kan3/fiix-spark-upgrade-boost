import { ArrowRight, Building2, UtensilsCrossed, Dumbbell, Wrench, GraduationCap, BedDouble, Factory, Landmark } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Local-business positioning section.
 *
 * CMMS marketing usually speaks to factories and large facility teams, which
 * makes small local operators assume the product isn't for them. This section
 * says the opposite out loud: flat pricing and simple setup make MaintenEase a
 * fit for any local business with equipment worth protecting.
 */

const businesses = [
  {
    icon: Building2,
    name: "Property management",
    detail: "HVAC, plumbing, and unit turnovers across every building you manage.",
  },
  {
    icon: UtensilsCrossed,
    name: "Restaurants & cafés",
    detail: "Keep walk-ins, fryers, and hood systems from failing on a Friday night.",
  },
  {
    icon: Dumbbell,
    name: "Gyms & fitness studios",
    detail: "Track treadmills and equipment safety checks members depend on.",
  },
  {
    icon: Wrench,
    name: "Auto shops & dealerships",
    detail: "Lifts, compressors, and diagnostic gear — serviced before they stall the bay.",
  },
  {
    icon: GraduationCap,
    name: "Schools & churches",
    detail: "Boilers, buses, and buildings on a schedule volunteers can follow.",
  },
  {
    icon: BedDouble,
    name: "Hotels & rentals",
    detail: "Room-by-room upkeep and guest-ready inspections without the binder.",
  },
  {
    icon: Factory,
    name: "Small manufacturers",
    detail: "Production equipment uptime without an enterprise CMMS budget.",
  },
  {
    icon: Landmark,
    name: "Municipal facilities",
    detail: "Parks, pools, and public buildings maintained on public budgets.",
  },
];

const LocalBusinesses = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <span className="inline-block bg-primary/10 text-primary text-xs font-semibold px-3 py-1.5 rounded-full mb-4 uppercase tracking-wide">
            Who it's for
          </span>
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-4">
            Built for local businesses, not just factories
          </h2>
          <p className="text-lg text-muted-foreground">
            If your business runs on equipment that can break, MaintenEase fits —
            one flat price, no IT department required, live in days.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
          {businesses.map((b) => (
            <div
              key={b.name}
              className="rounded-xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                <b.icon className="h-5 w-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-1.5">{b.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{b.detail}</p>
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <button
            type="button"
            onClick={() => navigate("/solutions")}
            className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
          >
            Explore solutions by use case
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </section>
  );
};

export default LocalBusinesses;
