import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  Boxes,
  Building2,
  CalendarCheck2,
  ClipboardList,
  MonitorCog,
  ShieldCheck,
  UsersRound,
  Wrench,
} from "lucide-react";
import { Link } from "react-router-dom";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { Button } from "@/components/ui/button";
import {
  FACILITY_MANAGEMENT_FAQS,
  FACILITY_MANAGEMENT_KPIS,
  FACILITY_MANAGEMENT_PAGE,
  FACILITY_MANAGEMENT_PATHS,
  FACILITY_MANAGEMENT_SOURCES,
} from "@/data/facilityManagement";

const ICONS = {
  wrench: Wrench,
  clipboard: ClipboardList,
  calendar: CalendarCheck2,
  boxes: Boxes,
  shield: ShieldCheck,
  building: Building2,
  users: UsersRound,
  monitor: MonitorCog,
} as const;

const FacilityManagementPage = () => {
  const url = "https://maintenease.com/facility-management";
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FACILITY_MANAGEMENT_FAQS.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: { "@type": "Answer", text: faq.a },
    })),
  };
  const articleLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: FACILITY_MANAGEMENT_PAGE.title,
    description: FACILITY_MANAGEMENT_PAGE.description,
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    datePublished: FACILITY_MANAGEMENT_PAGE.published,
    dateModified: FACILITY_MANAGEMENT_PAGE.updated,
    author: { "@type": "Organization", name: "MaintenEase" },
    publisher: {
      "@type": "Organization",
      name: "MaintenEase",
      logo: { "@type": "ImageObject", url: "https://maintenease.com/favicon.png" },
    },
  };

  return (
    <MarketingLayout>
      <Helmet>
        <title>{FACILITY_MANAGEMENT_PAGE.metaTitle}</title>
        <meta name="description" content={FACILITY_MANAGEMENT_PAGE.metaDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={FACILITY_MANAGEMENT_PAGE.metaTitle} />
        <meta property="og:description" content={FACILITY_MANAGEMENT_PAGE.metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={FACILITY_MANAGEMENT_PAGE.metaTitle} />
        <meta name="twitter:description" content={FACILITY_MANAGEMENT_PAGE.metaDescription} />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
        <script type="application/ld+json">{JSON.stringify(articleLd)}</script>
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      </Helmet>
      <MarketingJsonLd />

      <main>
        <section className="container mx-auto max-w-6xl px-4 py-12 md:py-20">
          <nav className="text-sm text-muted-foreground" aria-label="Breadcrumb">
            <Link to="/learn" className="transition-colors duration-150 hover:text-primary">Learn</Link>
            <span className="mx-2" aria-hidden="true">/</span>
            <span className="text-foreground">Facility management</span>
          </nav>

          <div className="mt-8 grid items-end gap-10 lg:grid-cols-[minmax(0,1fr)_340px]">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Facility management hub</p>
              <h1 className="mt-4 max-w-4xl font-headline text-4xl font-bold tracking-normal text-foreground text-balance md:text-6xl">
                {FACILITY_MANAGEMENT_PAGE.title}
              </h1>
              <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl">
                {FACILITY_MANAGEMENT_PAGE.description}
              </p>
              <div className="mt-7 flex flex-wrap gap-3">
                <Button asChild size="lg" className="min-h-11 transition-[transform,background-color,box-shadow] duration-150 active:scale-[0.96]">
                  <Link to="/auth?signup=true">Run facilities in MaintenEase</Link>
                </Button>
                <Button asChild size="lg" variant="outline" className="min-h-11 transition-[transform,background-color,border-color] duration-150 active:scale-[0.96]">
                  <Link to="/solutions/facility-maintenance-software">Explore facility software</Link>
                </Button>
              </div>
            </div>

            <aside className="rounded-3xl bg-primary/5 p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
              <p className="text-sm font-semibold text-primary">Use this hub to connect</p>
              <ul className="mt-4 space-y-3 text-sm leading-relaxed text-foreground">
                <li>Building services to accountable work orders</li>
                <li>Assets and spaces to inspection evidence</li>
                <li>Compliance and vendor work to retained records</li>
                <li>Operational data to KPIs and software selection</li>
              </ul>
            </aside>
          </div>
        </section>

        <section className="border-y border-border bg-muted/30 py-16" aria-labelledby="facility-paths-title">
          <div className="container mx-auto max-w-6xl px-4">
            <div className="max-w-3xl">
              <p className="text-sm font-semibold uppercase tracking-[0.16em] text-primary">Choose a workstream</p>
              <h2 id="facility-paths-title" className="mt-3 font-headline text-3xl font-bold text-foreground text-balance md:text-4xl">
                Navigate the facility management system
              </h2>
              <p className="mt-4 leading-relaxed text-muted-foreground text-pretty">
                Start with the operational problem in front of you. Each path below connects the business responsibility to a practical maintenance or software workflow.
              </p>
            </div>

            <div className="mt-9 grid gap-4 md:grid-cols-2">
              {FACILITY_MANAGEMENT_PATHS.map((path) => {
                const Icon = ICONS[path.icon];
                const content = (
                  <>
                    <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="h-5 w-5" aria-hidden="true" />
                    </span>
                    <h3 className="mt-5 text-xl font-semibold text-foreground text-balance">{path.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{path.description}</p>
                    <span className="mt-5 inline-flex min-h-10 items-center font-semibold text-primary">
                      {path.cta}<ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                    </span>
                  </>
                );
                const className = "rounded-2xl bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] transition-[box-shadow,transform] duration-150 hover:shadow-lg active:scale-[0.96]";
                return path.href.startsWith("#") ? (
                  <a key={path.title} href={path.href} className={className}>{content}</a>
                ) : (
                  <Link key={path.title} to={path.href} className={className}>{content}</Link>
                );
              })}
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 py-16">
          <div className="grid gap-10 lg:grid-cols-3">
            <section id="compliance-and-risk" className="scroll-mt-24">
              <p className="text-sm font-semibold text-primary">Compliance and risk</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground text-balance">Turn obligations into scheduled evidence</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground text-pretty">
                Build a compliance register that names the authority or policy, covered asset or location, task, frequency, qualified role, acceptance criteria, retained evidence, and escalation rule. Schedule the work; do not rely on a calendar reminder with no completion record.
              </p>
            </section>
            <section id="space-and-occupants" className="scroll-mt-24">
              <p className="text-sm font-semibold text-primary">Space and occupants</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground text-balance">Use location data as the shared map</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground text-pretty">
                Connect buildings, floors, rooms, zones, occupants, and service assets. This lets requests arrive with a usable location, reveals repeated comfort or accessibility issues, and keeps moves or space changes from separating equipment from its operating history.
              </p>
            </section>
            <section id="vendors-and-service-partners" className="scroll-mt-24">
              <p className="text-sm font-semibold text-primary">Vendors and service partners</p>
              <h2 className="mt-2 text-2xl font-bold text-foreground text-balance">Keep outsourced work inside the operating record</h2>
              <p className="mt-4 leading-relaxed text-muted-foreground text-pretty">
                Define scope, response time, site access, permits, insurance, warranty, pricing, and close-out evidence before dispatch. Give vendors only the information needed for assigned work and retain their notes, photos, costs, and certificates against the facility or asset.
              </p>
            </section>
          </div>
        </section>

        <section className="border-y border-border bg-muted/30 py-16">
          <div className="container mx-auto max-w-6xl px-4">
            <h2 className="font-headline text-3xl font-bold text-foreground text-balance">Facility management KPIs that support decisions</h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-muted-foreground text-pretty">
              Choose metrics with an owner, consistent clock, and decision attached. Segment the result by building, asset class, priority, and service type before treating a portfolio average as an operating truth.
            </p>
            <div className="mt-7 overflow-x-auto rounded-2xl bg-background shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
              <table className="w-full min-w-[760px] text-left text-sm">
                <thead className="bg-primary/5">
                  <tr>
                    <th className="px-5 py-4 font-semibold text-foreground">KPI</th>
                    <th className="px-5 py-4 font-semibold text-foreground">Definition</th>
                    <th className="px-5 py-4 font-semibold text-foreground">Decision supported</th>
                  </tr>
                </thead>
                <tbody>
                  {FACILITY_MANAGEMENT_KPIS.map((row) => (
                    <tr key={row[0]} className="border-t border-border">
                      {row.map((cell, index) => (
                        <td key={cell} className={`px-5 py-4 align-top leading-relaxed text-foreground ${index === 0 ? "font-semibold" : ""}`}>{cell}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="container mx-auto max-w-4xl px-4 py-16">
          <h2 className="font-headline text-3xl font-bold text-foreground text-balance">Frequently asked questions</h2>
          <div className="mt-7 space-y-4">
            {FACILITY_MANAGEMENT_FAQS.map((faq) => (
              <div key={faq.q} className="rounded-2xl bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
                <h3 className="font-semibold text-foreground text-balance">{faq.q}</h3>
                <p className="mt-2 leading-relaxed text-muted-foreground text-pretty">{faq.a}</p>
              </div>
            ))}
          </div>

          <div className="mt-12">
            <h2 className="text-2xl font-semibold text-foreground">Sources and standards</h2>
            <ul className="mt-4 space-y-3">
              {FACILITY_MANAGEMENT_SOURCES.map((source) => (
                <li key={source.url}>
                  <a href={source.url} target="_blank" rel="noreferrer" className="inline-flex min-h-10 items-center text-primary underline underline-offset-4 hover:no-underline">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </section>

        <section className="container mx-auto max-w-6xl px-4 pb-20">
          <div className="rounded-3xl bg-primary px-6 py-10 text-primary-foreground shadow-lg sm:px-10">
            <h2 className="font-headline text-3xl font-bold text-balance">Connect facility requests, assets, PMs, and evidence</h2>
            <p className="mt-4 max-w-3xl leading-relaxed text-primary-foreground/85 text-pretty">
              MaintenEase gives facility and maintenance teams one mobile work queue, location-based asset history, recurring maintenance, inspections, and reporting without a long enterprise rollout.
            </p>
            <Button asChild size="lg" variant="secondary" className="mt-6 min-h-11 transition-[transform,box-shadow] duration-150 active:scale-[0.96]">
              <Link to="/auth?signup=true">Start your facility workspace</Link>
            </Button>
          </div>
        </section>
      </main>
    </MarketingLayout>
  );
};

export default FacilityManagementPage;
