import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2, ClipboardCheck, Wrench, BarChart3, Bell, Calendar, Users } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const URL = "https://maintenease.com/maintenance-simplified";
const TITLE = "Maintenance Simplified: A Practical Playbook for Small Teams";
const DESCRIPTION =
  "Maintenance simplified — a practical playbook, checklist, and free calculator to run PMs, work orders, and reports without the spreadsheet mess.";

const principles = [
  {
    icon: ClipboardCheck,
    title: "One list, not five",
    body: "Every request, PM, and repair lives on one prioritized board so nothing falls between texts, whiteboards, and inboxes.",
  },
  {
    icon: Calendar,
    title: "PMs on autopilot",
    body: "Set the interval once. Recurring preventive maintenance auto-generates work orders and assigns the right tech.",
  },
  {
    icon: Bell,
    title: "Requests without training",
    body: "A public QR link lets tenants and staff submit issues — no login, no app install, no phone tag.",
  },
  {
    icon: Wrench,
    title: "Assets that tell their story",
    body: "Each asset carries its manuals, warranty, PM history, and cost so the next tech isn't starting from zero.",
  },
  {
    icon: BarChart3,
    title: "Reports the owner actually reads",
    body: "MTBF, MTTR, backlog, and spend on one dashboard — the numbers that answer 'is maintenance under control?'",
  },
  {
    icon: Users,
    title: "Flat pricing, whole crew",
    body: "No per-seat math. Add every tech, contractor, and manager on one plan so nobody works off-system.",
  },
];

const checklist = [
  "Move every open request into one shared inbox this week",
  "List your top 20 critical assets — the ones that hurt when they fail",
  "Set a PM schedule for each critical asset (weekly, monthly, quarterly)",
  "Publish a QR request link at reception, break rooms, and shop floors",
  "Agree on 3 KPIs the owner reviews monthly: backlog, MTTR, PM compliance",
  "Review one asset's cost history each month and act on the outlier",
];

const faqs = [
  {
    q: "What does 'maintenance simplified' actually mean?",
    a: "It means running preventive maintenance, work orders, and requests from one system with one shared view — instead of juggling spreadsheets, whiteboards, group texts, and paper. The goal is fewer tools, clearer ownership, and reports the owner can trust.",
  },
  {
    q: "How do small teams simplify maintenance without a big rollout?",
    a: "Start with a single week of requests in one inbox, a PM schedule for your top 20 critical assets, and a QR request link staff can scan. Add more assets and workflows as the basics stick.",
  },
  {
    q: "Do I need a full CMMS to simplify maintenance?",
    a: "For a handful of assets, a shared spreadsheet works. Past ~50 assets or more than one tech, a lightweight CMMS pays back quickly because PMs stop slipping and work order history stops disappearing.",
  },
  {
    q: "How is MaintenEase different from spreadsheets?",
    a: "Requests, PMs, work orders, assets, and reports live in one place with mobile access. PMs auto-generate, techs check off work from their phone, and owners see backlog and spend without asking for a report.",
  },
  {
    q: "What does simplified maintenance cost?",
    a: "MaintenEase starts at $49/month flat for the whole crew, with a 7-day free trial. Use the free cost calculator to compare against per-seat CMMS pricing for your team size.",
  },
];

const MaintenanceSimplifiedPage = () => (
  <div className="min-h-screen flex flex-col bg-background text-foreground">
    <Helmet>
      <title>{TITLE}</title>
      <meta name="description" content={DESCRIPTION} />
      <link rel="canonical" href={URL} />
      <meta name="robots" content="index,follow,max-image-preview:large" />
      <meta property="og:title" content={TITLE} />
      <meta property="og:description" content={DESCRIPTION} />
      <meta property="og:url" content={URL} />
      <meta property="og:type" content="article" />
      <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={TITLE} />
      <meta name="twitter:description" content={DESCRIPTION} />
      <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline: TITLE,
          description: DESCRIPTION,
          mainEntityOfPage: URL,
          image: "https://maintenease.com/og-image.png?v=4",
          author: { "@type": "Organization", name: "MaintenEase" },
          publisher: {
            "@type": "Organization",
            name: "MaintenEase",
            logo: { "@type": "ImageObject", url: "https://maintenease.com/favicon.png" },
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
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Home", item: "https://maintenease.com/" },
            { "@type": "ListItem", position: 2, name: "Maintenance Simplified", item: URL },
          ],
        })}
      </script>
    </Helmet>

    <Navbar />

    <main className="flex-1">
      <section className="container mx-auto px-4 py-16 md:py-24 max-w-4xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-secondary mb-3">
          The playbook
        </p>
        <h1 className="font-headline text-4xl md:text-5xl font-bold leading-tight text-foreground mb-6">
          Maintenance simplified: the small-team playbook
        </h1>
        <p className="text-lg md:text-xl text-muted-foreground leading-relaxed mb-8">
          Maintenance gets messy when work lives in five places at once. This is the shortest
          path we've seen to a calm operation: one inbox, one PM calendar, one asset history,
          and one dashboard the owner actually reads.
        </p>
        <div className="flex flex-wrap gap-3 mb-10">
          <Button asChild size="lg" className="uppercase tracking-wide font-semibold">
            <Link to="/auth?signup=true">
              Start free trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link to="/cmms-cost-calculator">Try the cost calculator</Link>
          </Button>
        </div>
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-success" /> 7-day free trial
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-success" /> Flat price for the whole crew
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="h-4 w-4 text-success" /> Free onboarding & data import
          </span>
        </div>
      </section>

      <section className="bg-card border-y border-border py-16">
        <div className="container mx-auto px-4 max-w-5xl">
          <h2 className="font-headline text-3xl font-bold text-foreground mb-3">
            The 6 principles behind simplified maintenance
          </h2>
          <p className="text-muted-foreground mb-10 max-w-2xl">
            Every team we work with lands on the same handful of habits. Adopt these in order and
            most of the daily chaos disappears in a month.
          </p>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {principles.map(({ icon: Icon, title, body }) => (
              <div
                key={title}
                className="rounded-xl border border-border bg-background p-6 shadow-sm"
              >
                <div className="mb-4 inline-flex items-center justify-center rounded-lg bg-primary/10 p-3">
                  <Icon className="h-6 w-6 text-primary" aria-hidden />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <h2 className="font-headline text-3xl font-bold text-foreground mb-3">
          The one-page maintenance simplified checklist
        </h2>
        <p className="text-muted-foreground mb-8">
          Print it, tape it to the shop wall, tick one item a week. Every box moves you toward a
          calmer operation.
        </p>
        <ol className="space-y-3">
          {checklist.map((item, i) => (
            <li
              key={item}
              className="flex gap-4 items-start rounded-lg border border-border bg-card p-4"
            >
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground font-semibold text-sm">
                {i + 1}
              </span>
              <span className="text-foreground pt-0.5">{item}</span>
            </li>
          ))}
        </ol>
      </section>

      <section className="bg-muted/40 border-y border-border py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h2 className="font-headline text-3xl font-bold text-foreground mb-3">
            See the numbers on your own team
          </h2>
          <p className="text-muted-foreground mb-6 max-w-2xl">
            Plug in your team size, average work order volume, and downtime cost. The calculator
            shows what simplifying maintenance is worth in dollars and hours — no email required.
          </p>
          <Button asChild size="lg">
            <Link to="/cmms-cost-calculator">
              Open the free calculator <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <div className="mt-10 grid sm:grid-cols-3 gap-4 text-sm">
            <Link
              to="/learn/cmms"
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-ui"
            >
              <p className="font-semibold text-foreground mb-1">What is a CMMS?</p>
              <p className="text-muted-foreground">A 5-minute plain-English primer.</p>
            </Link>
            <Link
              to="/learn/preventive-maintenance"
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-ui"
            >
              <p className="font-semibold text-foreground mb-1">Preventive maintenance</p>
              <p className="text-muted-foreground">How to plan PMs without over-servicing.</p>
            </Link>
            <Link
              to="/learn/mttr"
              className="rounded-xl border border-border bg-card p-5 hover:border-primary/30 transition-ui"
            >
              <p className="font-semibold text-foreground mb-1">MTTR & MTBF</p>
              <p className="text-muted-foreground">The two numbers owners want to see.</p>
            </Link>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16 max-w-3xl">
        <h2 className="font-headline text-3xl font-bold text-foreground mb-8">
          Maintenance simplified — FAQ
        </h2>
        <Accordion type="single" collapsible className="w-full">
          {faqs.map((f, i) => (
            <AccordionItem key={f.q} value={`faq-${i}`}>
              <AccordionTrigger className="text-left font-semibold">{f.q}</AccordionTrigger>
              <AccordionContent className="text-muted-foreground leading-relaxed">
                {f.a}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </section>

      <section className="container mx-auto px-4 pb-20 max-w-4xl">
        <div
          className="rounded-2xl p-10 md:p-14 text-center text-primary-foreground"
          style={{ background: "linear-gradient(135deg, hsl(226 100% 28%), hsl(226 100% 18%))" }}
        >
          <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4">
            Ready to see maintenance simplified in your shop?
          </h2>
          <p className="text-primary-foreground/85 text-lg mb-8 max-w-2xl mx-auto">
            Start a 7-day free trial. Import your assets, publish a QR request link, and put your
            first PMs on autopilot the same afternoon.
          </p>
          <Button asChild size="lg" className="bg-background text-primary hover:bg-background/90 uppercase tracking-wide font-semibold">
            <Link to="/auth?signup=true">
              Start free trial <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>

    <Footer />
  </div>
);

export default MaintenanceSimplifiedPage;