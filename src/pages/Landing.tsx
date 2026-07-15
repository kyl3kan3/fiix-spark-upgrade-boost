import { Helmet } from "react-helmet-async";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CheckCircle2, Building2, Zap, Calendar, BarChart3, Shield } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";

const benefits = [
  {
    icon: Zap,
    title: "Predict failures early",
    description: "AI alerts catch equipment issues before they turn into costly downtime.",
  },
  {
    icon: Calendar,
    title: "Schedule work in minutes",
    description: "Drag-and-drop PM calendars keep every asset on its maintenance rhythm.",
  },
  {
    icon: BarChart3,
    title: "See what's costing you",
    description: "Track work orders, labor, and parts spend in one clean dashboard.",
  },
  {
    icon: Shield,
    title: "One flat price",
    description: "Add your whole crew for $49/mo — no per-seat surprises as you grow.",
  },
];

const checks = [
  "7-day free trial",
  "Card required — cancel anytime",
  "Free onboarding & data import",
  "Unlimited work orders & assets",
];

// Source of truth for both the visible FAQ section and the FAQPage JSON-LD.
// Google's FAQ rich-result eligibility requires the Q&A text on the page to
// match the structured data verbatim, so render both from this array.
const faqs = [
  {
    q: "Is there a free trial?",
    a: "Yes — MaintenEase includes a 7-day free trial on every plan. A card is required and you can cancel anytime before day 8 to avoid charges.",
  },
  {
    q: "How much does MaintenEase cost?",
    a: "Plans start at $49/month for Starter (2 seats), $129/month for Pro (4 seats), and $299/month for Business. Annual billing saves 17%.",
  },
  {
    q: "Do I have to import my data manually?",
    a: "No — free onboarding and data import are included so techs stop losing work between texts and whiteboards from day one.",
  },
  {
    q: "How does MaintenEase prevent downtime?",
    a: "AI alerts flag equipment issues before they turn into failures, and drag-and-drop PM calendars keep every asset on its maintenance rhythm.",
  },
  {
    q: "Can my whole crew use it?",
    a: "Yes. Add your whole crew for one flat price — Starter and Pro include seats up front, and Business adds extra seats for $15/month each.",
  },
  {
    q: "What do owners get out of it?",
    a: "Owners stop guessing what is actually done. A clean dashboard tracks work orders, labor, and parts spend so you always know where time and money go.",
  },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      <Helmet>
        <title>MaintenEase — Stop Downtime Before It Starts</title>
        <meta
          name="description"
          content="Techs stop losing work between texts and whiteboards. Owners stop guessing what is actually done."
        />
        <link rel="canonical" href="https://maintenease.com/landing" />
        <meta name="robots" content="index,follow,max-image-preview:large" />
        <meta property="og:title" content="MaintenEase — Stop Downtime Before It Starts" />
        <meta
          property="og:description"
          content="Techs stop losing work between texts and whiteboards. Owners stop guessing what is actually done."
        />
        <meta property="og:url" content="https://maintenease.com/landing" />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />
        <meta property="og:image:type" content="image/png" />
        <meta property="og:image:alt" content="MaintenEase — Stop downtime before it starts. Navy card with the MaintenEase wordmark, emerald gear-and-wrench mark, and the tagline about techs and owners." />
        <meta property="og:site_name" content="MaintenEase" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="MaintenEase — Stop Downtime Before It Starts" />
        <meta name="twitter:description" content="Techs stop losing work between texts and whiteboards. Owners stop guessing what is actually done." />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
        <meta name="twitter:image:alt" content="MaintenEase — Stop downtime before it starts. Navy card with the MaintenEase wordmark, emerald gear-and-wrench mark, and the tagline about techs and owners." />
        <meta name="twitter:site" content="@maintenease" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "SoftwareApplication",
            name: "MaintenEase",
            applicationCategory: "BusinessApplication",
            applicationSubCategory: "Computerized Maintenance Management System (CMMS)",
            operatingSystem: "Web",
            url: "https://maintenease.com/landing",
            image: "https://maintenease.com/og-image.png?v=4",
            description:
              "Techs stop losing work between texts and whiteboards. Owners stop guessing what is actually done.",
            offers: {
              "@type": "Offer",
              price: "49",
              priceCurrency: "USD",
              priceSpecification: {
                "@type": "UnitPriceSpecification",
                price: "49",
                priceCurrency: "USD",
                unitText: "MONTH",
              },
              availability: "https://schema.org/InStock",
              url: "https://maintenease.com/pricing",
            },
            publisher: {
              "@type": "Organization",
              name: "MaintenEase",
              url: "https://maintenease.com/",
              logo: "https://maintenease.com/favicon.png",
            },
          })}
        </script>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: faqs.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          })}
        </script>
      </Helmet>
      <MarketingJsonLd />
      <Navbar />

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden pt-32 pb-20 md:pt-40 md:pb-28">
          <div
            aria-hidden
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage:
                "linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.05) 1px, transparent 1px)",
              backgroundSize: "48px 48px",
              maskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 75%)",
              WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 75%)",
            }}
          />
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center max-w-3xl mx-auto space-y-8">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-full text-xs font-semibold text-primary shadow-sm">
                <Zap className="h-3.5 w-3.5 text-secondary" />
                AI-powered maintenance management
              </div>
              <h1 className="font-headline text-4xl md:text-6xl font-bold leading-[1.1] text-foreground">
                Stop downtime before it starts.
              </h1>
              <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Techs stop losing work between texts and whiteboards. Owners stop guessing what is actually done.
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                <Button
                  size="lg"
                  className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary-variant px-8 shadow-md uppercase tracking-wide font-semibold group"
                  onClick={() => navigate("/auth?signup=true")}
                >
                  Start free trial
                  <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full sm:w-auto border-primary/20 text-primary hover:bg-primary/5"
                  onClick={() => navigate("/features")}
                >
                  See features
                </Button>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm text-muted-foreground pt-4">
                {checks.map((item) => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle2 className="h-4 w-4 text-success" />
                    {item}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Benefits */}
        <section className="py-20 bg-card border-y border-border">
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              {benefits.map(({ icon: Icon, title, description }) => (
                <div
                  key={title}
                  className="rounded-xl border border-border bg-background p-6 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md"
                >
                  <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="py-20">
          <div className="container mx-auto px-4 max-w-4xl">
            <div
              className="rounded-2xl p-8 md:p-16 text-center"
              style={{ background: "linear-gradient(135deg, hsl(226 100% 28%), hsl(226 100% 18%))" }}
            >
              <div className="inline-flex items-center gap-2 mb-6 px-3 py-1.5 rounded-full bg-primary-foreground/10 text-primary-foreground text-sm font-semibold">
                <Building2 className="h-4 w-4" />
                Trusted by facility teams everywhere
              </div>
              <h2 className="font-headline text-3xl md:text-4xl font-bold mb-6 text-primary-foreground">
                Bring your whole crew for one flat price.
              </h2>
              <p className="text-primary-foreground/80 text-lg mb-8 max-w-2xl mx-auto">
                No per-user fees. No hidden add-ons. Start your 7-day trial and see why teams switch to
                MaintenEase.
              </p>
              <Button
                size="lg"
                className="bg-background text-primary hover:bg-background/90 font-semibold uppercase tracking-wide shadow-md group"
                onClick={() => navigate("/auth?signup=true")}
              >
                Start Free Trial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default Landing;
