import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import ShareButtons from "@/components/marketing/ShareButtons";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { ArrowRight } from "lucide-react";
import { comparisons } from "@/data/comparisons";
import {
  computeCmmsCosts,
  formatUsd,
  DEFAULT_TEAM_SIZE,
  MIN_TEAM_SIZE,
  MAX_TEAM_SIZE,
} from "@/lib/cmmsSavings";

// Chart colors validated with the palette validator (light #2952e6 / dark
// #3366ff accent vs #64748b neutral: lightness, CVD ΔE≈61, contrast all pass).
// Identity is never color-alone — every bar carries its vendor name + value.
const BAR_ACCENT = "bg-[#2952e6] dark:bg-[#3366ff]";
const BAR_NEUTRAL = "bg-[#64748b]";

const FAQS = [
  {
    q: "Where do the competitor prices come from?",
    a: "Publicly listed entry/standard per-user tiers as of 2026 (UpKeep Starter, MaintainX Essential, Limble Standard, Fiix Basic). They're illustrative — vendors change pricing, so always confirm current rates on their sites. MaintenEase is not affiliated with any of them.",
  },
  {
    q: "Is per-seat pricing ever cheaper than MaintenEase?",
    a: "Yes — for very small crews. A 2-person team on a $21/user plan pays $42/mo, less than the $129 flat fee. The math flips fast though: per-seat overtakes the flat fee at 3 technicians for $45/user tools and at 7 for $21/user tools, and the gap keeps widening with every hire.",
  },
  {
    q: "Does the flat fee really cover my whole crew?",
    a: "The calculator uses the MaintenEase Pro plan ($129/mo). Compare plan details on the pricing page to pick the tier that fits your operation — every plan starts with a 7-day free trial (card required; cancel before day 8, no charge).",
  },
];

const CostCalculatorPage = () => {
  const [teamSize, setTeamSize] = useState(DEFAULT_TEAM_SIZE);
  const result = computeCmmsCosts(teamSize);

  const url = "https://maintenease.com/cmms-cost-calculator";
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQS.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Compare", item: "https://maintenease.com/compare" },
      { "@type": "ListItem", position: 2, name: "CMMS Cost Calculator", item: url },
    ],
  };

  const rows = [
    {
      name: "MaintenEase",
      plan: "Pro — flat fee",
      monthly: result.maintenease,
      accent: true,
      note: "whole crew included",
    },
    ...result.vendors.map((v) => ({
      name: v.name,
      plan: `${v.plan} — $${v.perUser}/user`,
      monthly: v.monthly,
      accent: false,
      note:
        v.monthlySavings > 0
          ? `${formatUsd(v.monthlySavings)}/mo more than MaintenEase`
          : v.monthlySavings < 0
            ? `${formatUsd(v.monthlySavings)}/mo cheaper at this size`
            : "same cost at this size",
    })),
  ];

  return (
    <MarketingLayout>
      <Helmet>
        <title>CMMS Cost Calculator — Per-Seat vs Flat-Fee Pricing | MaintenEase</title>
        <meta
          name="description"
          content="Free CMMS cost calculator. See what UpKeep, MaintainX, Limble, and Fiix cost for your team size vs one flat fee — including where per-seat pricing is cheaper."
        />
        <link rel="canonical" href={url} />
        <meta property="og:title" content="CMMS Cost Calculator — Per-Seat vs Flat-Fee Pricing" />
        <meta property="og:description" content="What does a CMMS really cost for your crew? Compare per-seat pricing to one flat fee, honestly — breakevens included." />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="CMMS Cost Calculator — Per-Seat vs Flat-Fee Pricing" />
        <meta name="twitter:description" content="What does a CMMS really cost for your crew? Compare per-seat pricing to one flat fee, honestly — breakevens included." />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>
      <MarketingJsonLd />

      {/* Hero */}
      <section className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/compare" className="hover:text-primary transition-colors">Compare</Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">CMMS Cost Calculator</span>
        </nav>
        <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-normal mb-4 text-foreground">
          What does a CMMS really cost for your crew?
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Per-seat pricing looks cheap until you add the whole team. Slide to your crew size and see the monthly
          bill on each per-user CMMS next to one flat fee — including where per-seat is honestly the better deal.
        </p>
      </section>

      {/* Calculator */}
      <section className="container mx-auto px-4 pb-16 max-w-4xl">
        <div className="rounded-2xl border border-border bg-card shadow-sm p-6 md:p-10">
          {/* Team size control */}
          <div className="mb-10">
            <div className="flex items-end justify-between mb-4">
              <label htmlFor="team-size" className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Technicians on your team
              </label>
              <span className="font-headline text-4xl font-bold text-foreground tabular-nums" aria-live="polite">
                {result.teamSize}
              </span>
            </div>
            <Slider
              id="team-size"
              value={[result.teamSize]}
              min={MIN_TEAM_SIZE}
              max={MAX_TEAM_SIZE}
              step={1}
              onValueChange={([v]) => setTeamSize(v)}
              aria-label="Number of technicians"
            />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{MIN_TEAM_SIZE}</span>
              <span>{MAX_TEAM_SIZE}</span>
            </div>
          </div>

          {/* Stat tiles */}
          <div className="grid sm:grid-cols-3 gap-4 mb-10">
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                MaintenEase Pro
              </p>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {formatUsd(result.maintenease)}<span className="text-sm font-medium text-muted-foreground">/mo</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">flat — team size doesn't change it</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Priciest per-seat rival
              </p>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {formatUsd(result.maxMonthly)}<span className="text-sm font-medium text-muted-foreground">/mo</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">at {result.teamSize} technicians</p>
            </div>
            <div className="rounded-xl border border-border bg-background p-4">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">
                Best-case annual savings
              </p>
              <p className="text-2xl font-bold text-foreground tabular-nums">
                {formatUsd(result.bestAnnualSavings)}<span className="text-sm font-medium text-muted-foreground">/yr</span>
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                {result.beatsAllVendors
                  ? "MaintenEase beats every rival at this size"
                  : "some per-seat plans are cheaper at this size"}
              </p>
            </div>
          </div>

          {/* Cost comparison figure — direct-labeled horizontal bars */}
          <div role="img" aria-label={`Monthly CMMS cost comparison for a team of ${result.teamSize}`}>
            <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide mb-4">
              Monthly cost at {result.teamSize} technicians
            </h2>
            <ul className="space-y-4">
              {rows.map((row) => (
                <li key={row.name} title={`${row.name}: ${formatUsd(row.monthly)}/mo`}>
                  <div className="flex items-baseline justify-between gap-3 mb-1">
                    <span className="text-sm font-medium text-foreground">
                      {row.name}
                      <span className="ml-2 text-xs text-muted-foreground">{row.plan}</span>
                    </span>
                    <span className="text-sm font-bold text-foreground tabular-nums shrink-0">
                      {formatUsd(row.monthly)}/mo
                    </span>
                  </div>
                  <div className="h-3.5 rounded-r bg-muted/60 overflow-hidden">
                    <div
                      className={`h-full rounded-r transition-[width,filter] duration-300 ${row.accent ? BAR_ACCENT : BAR_NEUTRAL} hover:brightness-110`}
                      style={{ width: `${Math.max(3, (row.monthly / result.maxMonthly) * 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{row.note}</p>
                </li>
              ))}
            </ul>
          </div>

          <p className="text-xs text-muted-foreground mt-8 border-t border-border pt-4">
            Competitor pricing reflects publicly listed entry/standard per-user tiers as of 2026 and is illustrative
            only — verify current rates with each vendor. MaintenEase is not affiliated with UpKeep, MaintainX,
            Limble, or Fiix. MaintenEase figure is the Pro plan; per-user plans often also require annual commitment,
            while MaintenEase is month-to-month.
          </p>
        </div>

        {/* Breakeven strip */}
        <div className="mt-6 rounded-xl border border-border bg-muted/40 p-5">
          <h2 className="text-sm font-semibold text-foreground mb-2">When does the flat fee win?</h2>
          <p className="text-sm text-muted-foreground">
            {result.vendors
              .slice()
              .sort((a, b) => a.breakevenTeamSize - b.breakevenTeamSize)
              .map((v) => `${v.name} from ${v.breakevenTeamSize} technicians`)
              .join(" · ")}
            . Below those sizes, per-seat is genuinely cheaper — the flat fee pays off as your crew grows.
          </p>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-muted/40 border-y border-border py-14">
        <div className="container mx-auto px-4 max-w-3xl">
          <h2 className="font-headline text-3xl font-bold mb-8 text-foreground">Frequently asked questions</h2>
          <div className="space-y-4">
            {FAQS.map((f) => (
              <div key={f.q} className="p-6 rounded-xl border border-border bg-card shadow-sm">
                <h3 className="font-semibold text-foreground mb-2">{f.q}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA + related */}
      <section className="container mx-auto px-4 py-14 max-w-4xl">
        <div className="p-10 rounded-2xl text-center text-primary-foreground" style={{ background: "linear-gradient(135deg, hsl(226 100% 28%), hsl(226 100% 18%))" }}>
          <h2 className="font-headline text-3xl font-bold mb-3">Run the real numbers on your own crew</h2>
          <p className="text-lg text-primary-foreground/85 mb-8 max-w-2xl mx-auto">
            Start a 7-day free trial — one flat price, free onboarding and data import.
          </p>
          <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90 font-semibold uppercase tracking-wide shadow-md">
            <Link to="/auth?signup=true">Start free trial <ArrowRight className="ml-1 h-4 w-4" /></Link>
          </Button>
        </div>

        <h2 className="font-headline text-2xl font-semibold mt-12 mb-6 text-foreground">Full comparisons</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {comparisons.map((c) => (
            <Link
              key={c.slug}
              to={`/compare/${c.slug}`}
              className="block p-5 rounded-xl border border-border bg-card hover:border-primary/30 hover:shadow-md transition-ui group"
            >
              <h3 className="font-semibold text-foreground mb-1 group-hover:text-primary transition-colors">{c.h1}</h3>
              <p className="text-sm text-muted-foreground">{c.tagline}</p>
            </Link>
          ))}
        </div>
        <div className="mt-10 flex flex-col items-start gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-muted-foreground">Share this calculator</p>
          <ShareButtons
            url={url}
            title="CMMS Cost Calculator — Per-Seat vs Flat-Fee Pricing"
            description="See what UpKeep, MaintainX, Limble, and Fiix cost for your team size vs one flat fee."
          />
        </div>
      </section>
    </MarketingLayout>
  );
};

export default CostCalculatorPage;
