import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  Bot,
  Braces,
  Building2,
  CheckCircle2,
  ClipboardList,
  ExternalLink,
  KeyRound,
  MapPin,
  PackageSearch,
  PlusCircle,
  ShieldCheck,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { MCP_PAGE } from "@/data/mcpPage";

const CANONICAL = "https://maintenease.com/mcp";

const toolIcons: Record<(typeof MCP_PAGE.tools)[number]["name"], LucideIcon> = {
  list_work_orders: ClipboardList,
  create_work_order: PlusCircle,
  list_assets: PackageSearch,
  list_locations: MapPin,
  list_maintenance_requests: Building2,
};

const pageJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: MCP_PAGE.metaTitle,
  description: MCP_PAGE.metaDescription,
  url: CANONICAL,
  dateModified: MCP_PAGE.updated,
  about: {
    "@type": "Service",
    name: "MaintenEase MCP Server",
    serviceType: "Model Context Protocol server for CMMS software",
    provider: { "@id": "https://maintenease.com/#organization" },
    url: CANONICAL,
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: MCP_PAGE.faqs.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

const McpPage = () => (
  <MarketingLayout>
    <Helmet>
      <title>{MCP_PAGE.metaTitle}</title>
      <meta name="description" content={MCP_PAGE.metaDescription} />
      <link rel="canonical" href={CANONICAL} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={MCP_PAGE.metaTitle} />
      <meta property="og:description" content={MCP_PAGE.metaDescription} />
      <meta property="og:url" content={CANONICAL} />
      <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={MCP_PAGE.metaTitle} />
      <meta name="twitter:description" content={MCP_PAGE.metaDescription} />
      <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
      <script type="application/ld+json">{JSON.stringify(pageJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
    </Helmet>
    <MarketingJsonLd />

    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/[0.08] via-background to-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-0 h-80 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_68%)]" />
      <div className="container relative z-10 mx-auto grid max-w-6xl gap-10 px-4 py-14 md:py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
        <div>
          <div className="inline-flex min-h-10 items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary ring-1 ring-primary/15">
            <Bot className="h-4 w-4" aria-hidden="true" />
            MaintenEase MCP server
          </div>
          <h1 className="mt-6 max-w-4xl font-headline text-4xl font-bold tracking-normal text-foreground text-balance md:text-6xl">
            {MCP_PAGE.h1}
          </h1>
          <p className="mt-6 max-w-3xl text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl">
            {MCP_PAGE.intro}
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={MCP_PAGE.serverCardUrl}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-primary py-3 pl-5 pr-[18px] font-semibold text-primary-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:bg-primary/90 hover:shadow-md active:scale-[0.96]"
            >
              View server card
              <ExternalLink className="h-4 w-4" aria-hidden="true" />
            </a>
            <a
              href={MCP_PAGE.markdownUrl}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-card py-3 pl-5 pr-[18px] font-semibold text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] transition-[box-shadow,transform] duration-150 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.07)] active:scale-[0.96] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            >
              Read clean Markdown
              <Braces className="h-4 w-4" aria-hidden="true" />
            </a>
          </div>
        </div>

        <aside className="rounded-3xl bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
          <div className="flex items-center justify-between gap-4">
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Production connection</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground text-balance">Server details</h2>
            </div>
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-6 w-6" aria-hidden="true" />
            </div>
          </div>

          <dl className="mt-6 grid gap-4 text-sm">
            <div className="rounded-2xl bg-muted/70 p-4">
              <dt className="font-semibold text-muted-foreground">Endpoint</dt>
              <dd className="mt-2 break-all font-mono text-xs leading-relaxed text-foreground sm:text-sm">
                {MCP_PAGE.endpoint}
              </dd>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="rounded-2xl bg-muted/70 p-4">
                <dt className="font-semibold text-muted-foreground">Transport</dt>
                <dd className="mt-1 font-medium text-foreground">{MCP_PAGE.protocol}</dd>
              </div>
              <div className="rounded-2xl bg-muted/70 p-4">
                <dt className="font-semibold text-muted-foreground">Tools</dt>
                <dd className="mt-1 font-medium text-foreground tabular-nums">{MCP_PAGE.tools.length} available</dd>
              </div>
            </div>
            <div className="rounded-2xl bg-muted/70 p-4">
              <dt className="font-semibold text-muted-foreground">Authorization</dt>
              <dd className="mt-1 font-medium text-foreground">{MCP_PAGE.authorization}</dd>
            </div>
          </dl>
        </aside>
      </div>
    </section>

    <section className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Available tools</p>
        <h2 className="mt-3 font-headline text-3xl font-bold text-foreground text-balance md:text-4xl">
          Maintenance actions an AI client can discover
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
          Each tool has a declared purpose and validated input schema. The MCP server remains the boundary between the AI client and your maintenance records.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {MCP_PAGE.tools.map((tool) => {
          const Icon = toolIcons[tool.name];
          return (
            <article
              key={tool.name}
              className="rounded-2xl bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${tool.access === "Write" ? "bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300"}`}>
                  {tool.access}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground text-balance">{tool.title}</h3>
              <code className="mt-2 block text-xs font-semibold text-primary">{tool.name}</code>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground text-pretty">{tool.description}</p>
            </article>
          );
        })}
      </div>
    </section>

    <section className="border-y border-border bg-muted/35 py-16 md:py-24">
      <div className="container mx-auto grid max-w-6xl gap-12 px-4 lg:grid-cols-2">
        <div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <ShieldCheck className="h-6 w-6" aria-hidden="true" />
          </div>
          <h2 className="mt-5 font-headline text-3xl font-bold text-foreground text-balance md:text-4xl">
            Access stays inside your CMMS rules
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            MCP does not bypass authentication or hand an AI model direct database access. MaintenEase applies the same identity and company boundaries used by the application.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {MCP_PAGE.safeguards.map((safeguard) => (
            <article key={safeguard.title} className="rounded-2xl bg-card p-5 shadow-sm ring-1 ring-black/[0.06] dark:ring-white/[0.08]">
              <h3 className="font-semibold text-foreground text-balance">{safeguard.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{safeguard.description}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Connection flow</p>
        <h2 className="mt-3 font-headline text-3xl font-bold text-foreground text-balance md:text-4xl">
          From server card to approved tools
        </h2>
      </div>
      <ol className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
        {MCP_PAGE.steps.map((step, index) => (
          <li key={step.title} className="rounded-2xl bg-card p-6 shadow-sm ring-1 ring-black/[0.06] dark:ring-white/[0.08]">
            <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground tabular-nums">
              {index + 1}
            </span>
            <h3 className="mt-5 text-lg font-semibold text-foreground text-balance">{step.title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground text-pretty">{step.description}</p>
          </li>
        ))}
      </ol>
      <div className="mt-8 flex flex-wrap gap-3">
        <a
          href={MCP_PAGE.authDocumentationUrl}
          className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-foreground py-3 pl-5 pr-[18px] font-semibold text-background transition-[opacity,transform] duration-150 hover:opacity-90 active:scale-[0.96]"
        >
          Read authentication details
          <KeyRound className="h-4 w-4" aria-hidden="true" />
        </a>
      </div>
    </section>

    <section className="border-y border-border bg-muted/35 py-16 md:py-24">
      <div className="container mx-auto max-w-4xl px-4">
        <h2 className="font-headline text-3xl font-bold text-foreground text-balance md:text-4xl">
          MCP server questions
        </h2>
        <div className="mt-8 divide-y divide-border rounded-2xl bg-card px-6 shadow-sm ring-1 ring-black/[0.06] dark:ring-white/[0.08] sm:px-8">
          {MCP_PAGE.faqs.map((faq) => (
            <article key={faq.q} className="py-6">
              <h3 className="text-lg font-semibold text-foreground text-balance">{faq.q}</h3>
              <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">{faq.a}</p>
            </article>
          ))}
        </div>
      </div>
    </section>

    <section className="container mx-auto max-w-6xl px-4 py-16 md:py-20">
      <div className="rounded-3xl bg-primary p-7 text-primary-foreground shadow-lg sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="max-w-3xl">
            <h2 className="font-headline text-3xl font-bold text-balance">Explore the architecture before you connect</h2>
            <p className="mt-4 leading-relaxed text-primary-foreground/85 text-pretty">
              Read how MCP fits a maintenance workflow, how OAuth preserves user identity, and how controlled tools support an agentic CMMS.
            </p>
          </div>
          <Link
            to="/auth?signup=true"
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-background py-3 pl-5 pr-[18px] font-semibold text-foreground shadow-sm transition-[box-shadow,transform] duration-150 hover:shadow-md active:scale-[0.96]"
          >
            Start free trial
            <ArrowRight className="h-4 w-4" aria-hidden="true" />
          </Link>
        </div>
        <nav aria-label="Related MCP guides" className="mt-8 grid gap-3 border-t border-primary-foreground/20 pt-6 md:grid-cols-3">
          {MCP_PAGE.related.map((item) => (
            <Link
              key={item.href}
              to={item.href}
              className="group inline-flex min-h-11 items-center justify-between gap-3 rounded-xl bg-primary-foreground/10 px-4 py-3 font-medium text-primary-foreground transition-[background-color,transform] duration-150 hover:bg-primary-foreground/15 active:scale-[0.96]"
            >
              {item.label}
              <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </div>
    </section>
  </MarketingLayout>
);

export default McpPage;
