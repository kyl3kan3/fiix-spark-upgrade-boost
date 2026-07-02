
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Magnetic from "@/components/marketing/Magnetic";

// Keep these claims consistent with the canonical trial terms shown on
// PricingPage.tsx and the TrialBanner: a 7-day trial that requires a card and
// auto-charges on day 8 unless cancelled. Do not claim "no card required" here.
const features = [
 "7-day free trial on every plan",
 "Card required — cancel before day 8, no charge",
 "Free onboarding & data import",
 "Cancel or change plans anytime"
];

const CTA = () => {
 const navigate = useNavigate();
 return (
 <section id="cta" className="py-20 bg-card border-y border-border">
 <div className="container mx-auto px-4">
 <div className="rounded-2xl overflow-hidden" style={{ background: "linear-gradient(135deg, hsl(226 100% 28%), hsl(226 100% 18%))" }}>
 <div className="flex flex-col md:flex-row">
 <div className="md:w-1/2 p-8 md:p-16">
 <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6 text-primary-foreground">
 Stop paying per seat. Start preventing downtime.
 </h2>
 <p className="text-primary-foreground/80 text-lg mb-8 max-w-lg">
 Bring your whole crew onto MaintenEase for one flat price — and catch failures before they become expensive interruptions.
 </p>
 <ul className="mb-10 space-y-3">
 {features.map((feature, index) => (
 <li key={index} className="flex items-center text-primary-foreground">
 <CheckCircle className="h-5 w-5 mr-3 text-primary-foreground/70 shrink-0" />
 <span>{feature}</span>
 </li>
 ))}
 </ul>
 <Magnetic>
 <Button
 size="lg"
 className="bg-background text-primary hover:bg-background/90 group font-semibold uppercase tracking-wide shadow-md"
 onClick={() => navigate("/auth?signup=true")}
 >
 Start Free Trial
 <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
 </Button>
 </Magnetic>
 </div>
 <div className="md:w-1/2 bg-primary-foreground/10 p-8 md:p-16 flex items-center justify-center">
 <div className="bg-background rounded-xl p-6 md:p-8 shadow-xl w-full max-w-md">
              <h3 className="font-headline text-2xl font-bold mb-2 text-primary">Business Plan</h3>
              <p className="text-muted-foreground mb-6">For larger organizations with advanced needs</p>
 <div className="mb-8 pb-6 border-b border-border">
                <span className="text-4xl font-bold text-foreground">$299</span>
                <span className="text-muted-foreground">/month</span>
 </div>
 <ul className="mb-8 space-y-3">
 {[
                  "All MaintenEase features included",
                  "Unlimited assets & work orders",
                  "Email + chat support",
                  "SSO + API access",
                ].map((item) => (
 <li key={item} className="flex items-center text-foreground text-sm">
 <CheckCircle className="h-4 w-4 mr-3 text-primary shrink-0" />
                  <span>{item}</span>
 </li>
 ))}
 </ul>
 <Button
 className="w-full bg-primary text-primary-foreground hover:bg-primary-variant uppercase tracking-wide font-semibold"
 onClick={() => navigate("/auth?signup=true")}
 >
 Start free trial
 </Button>
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>
 );
};

export default CTA;
