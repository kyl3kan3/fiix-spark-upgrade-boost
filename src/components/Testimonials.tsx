import { Button } from "@/components/ui/button";
import { Quote, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Social-proof placeholder section.
 *
 * The previous version of this file shipped fabricated testimonials —
 * including one signed by "Sarah Johnson, Global Manufacturing Inc." that
 * referenced a competitor product ("Fiix has revolutionized..."). That is
 * brand-damaging and dishonest, so it has been removed.
 *
 * Until we have signed permission from real customers, this section is an
 * honest "early customers" prompt instead of a fake quote carousel.
 *
 * To restore testimonials: replace this component's body with a quote carousel
 * once real, attributable quotes exist (with company name + role + permission).
 */
const Testimonials = () => {
  const navigate = useNavigate();

  return (
    <section id="testimonials" className="py-20 bg-fiix-50">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-fiix-100 text-fiix-600 mb-6">
            <Quote className="h-6 w-6" />
          </div>
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-foreground">
            Be one of our first customer stories
          </h2>
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto mb-8">
            MaintenEase is brand-new and we're working hand-in-hand with our
            earliest teams. Start a trial and we'll personally onboard your
            assets, PMs, and reports — free.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-fiix-600 hover:bg-fiix-700 text-white px-8 group"
              onClick={() => navigate("/auth?signup=true")}
            >
              Start your trial
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              onClick={() => navigate("/pricing")}
            >
              See pricing
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
