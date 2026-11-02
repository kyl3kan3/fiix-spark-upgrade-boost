import { Building2, UtensilsCrossed, Dumbbell, Wrench, GraduationCap, BedDouble, Factory, Landmark } from "lucide-react";
import Reveal3D from "@/components/marketing/Reveal3D";
import Tilt3D from "@/components/marketing/Tilt3D";

const businesses = [
  { icon: Building2, name: "Property management" },
  { icon: UtensilsCrossed, name: "Restaurants & cafés" },
  { icon: Dumbbell, name: "Gyms & fitness studios" },
  { icon: Wrench, name: "Auto shops & dealerships" },
  { icon: GraduationCap, name: "Schools & churches" },
  { icon: BedDouble, name: "Hotels & rentals" },
  { icon: Factory, name: "Small manufacturers" },
  { icon: Landmark, name: "Municipal facilities" },
];

const LocalBusinesses = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-12 text-center">
        Local businesses
      </h2>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 max-w-6xl mx-auto">
        {businesses.map((b, index) => (
          <Reveal3D key={b.name} delayMs={(index % 4) * 90} className="h-full">
            <Tilt3D maxTilt={6} className="h-full">
              <div className="h-full rounded-xl border border-border bg-card p-6 transition-colors hover:border-primary/30 hover:shadow-md">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
                  <b.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground">{b.name}</h3>
              </div>
            </Tilt3D>
          </Reveal3D>
        ))}
      </div>
    </div>
  </section>
);

export default LocalBusinesses;
