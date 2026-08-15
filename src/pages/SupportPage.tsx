import { Helmet } from "react-helmet-async";
import {
  ArrowRight,
  BookOpen,
  CheckCircle2,
  ClipboardList,
  CreditCard,
  Database,
  KeyRound,
  LifeBuoy,
  Mail,
  MessageSquareText,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import {
  SUPPORT_FAQS,
  SUPPORT_PAGE,
  SUPPORT_REQUEST_CHECKLIST,
  SUPPORT_TOPICS,
} from "@/data/supportPage";

const topicIcons: Record<(typeof SUPPORT_TOPICS)[number]["id"], LucideIcon> = {
  "getting-started": Sparkles,
  "work-orders": ClipboardList,
  "preventive-maintenance": BookOpen,
  imports: Database,
  "account-billing": CreditCard,
  "ai-integrations": KeyRound,
};

const contactPageJsonLd = {
  "@context": "https://schema.org",
  "@type": "ContactPage",
  name: SUPPORT_PAGE.title,
  description: SUPPORT_PAGE.description,
  url: SUPPORT_PAGE.canonicalUrl,
  dateModified: SUPPORT_PAGE.updated,
  mainEntity: {
    "@type": "Organization",
    name: "MaintenEase",
    email: SUPPORT_PAGE.email,
    contactPoint: {
      "@type": "ContactPoint",
      contactType: "customer support",
      email: SUPPORT_PAGE.email,
      url: SUPPORT_PAGE.canonicalUrl,
    },
  },
};

const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SUPPORT_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

const SupportPage = () => (
  <MarketingLayout>
    <Helmet>
      <title>{SUPPORT_PAGE.title}</title>
      <meta name="description" content={SUPPORT_PAGE.description} />
      <link rel="canonical" href={SUPPORT_PAGE.canonicalUrl} />
      <meta property="og:type" content="website" />
      <meta property="og:title" content={SUPPORT_PAGE.title} />
      <meta property="og:description" content={SUPPORT_PAGE.description} />
      <meta property="og:url" content={SUPPORT_PAGE.canonicalUrl} />
      <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={SUPPORT_PAGE.title} />
      <meta name="twitter:description" content={SUPPORT_PAGE.description} />
      <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
      <script type="application/ld+json">{JSON.stringify(contactPageJsonLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqJsonLd)}</script>
    </Helmet>
    <MarketingJsonLd />

    <section className="relative overflow-hidden border-b border-border bg-gradient-to-b from-primary/[0.08] via-background to-background">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-80 bg-[radial-gradient(circle_at_top,rgba(59,130,246,0.14),transparent_68%)]" />
      <div className="container relative mx-auto grid max-w-6xl gap-10 px-4 py-14 md:py-20 lg:grid-cols-[1.08fr_0.92fr] lg:items-center">
        <div>
          <div className="enter-item enter-d1 inline-flex min-h-10 items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-sm font-semibold text-primary ring-1 ring-primary/15">
            <LifeBuoy className="h-4 w-4" aria-hidden="true" />
            MaintenEase support
          </div>
          <h1 className="enter-item enter-d2 mt-6 max-w-3xl font-headline text-4xl font-bold tracking-normal text-foreground text-balance md:text-6xl">
            {SUPPORT_PAGE.h1}
          </h1>
          <p className="enter-item enter-d3 mt-6 max-w-2xl text-lg leading-relaxed text-muted-foreground text-pretty md:text-xl">
            {SUPPORT_PAGE.intro}
          </p>
          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <a
              href={SUPPORT_PAGE.emailHref}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-primary py-3 pl-5 pr-[18px] font-semibold text-primary-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:bg-primary/90 hover:shadow-md active:scale-[0.96]"
            >
              Email support
              <Mail className="h-4 w-4" aria-hidden="true" />
            </a>
            <Link
              to="/help"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-card py-3 pl-5 pr-[18px] font-semibold text-foreground shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] transition-[box-shadow,transform] duration-150 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.08),0_4px_8px_rgba(0,0,0,0.07)] active:scale-[0.96] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            >
              Open signed-in Help Center
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <aside className="rounded-3xl bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_12px_32px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] sm:p-8">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary/10 text-secondary">
              <MessageSquareText className="h-6 w-6" aria-hidden="true" />
            </div>
            <div>
              <p className="text-sm font-semibold uppercase tracking-wide text-primary">Faster troubleshooting</p>
              <h2 className="mt-2 text-2xl font-semibold text-foreground text-balance">What to include</h2>
            </div>
          </div>
          <ul className="mt-6 grid gap-3">
            {SUPPORT_REQUEST_CHECKLIST.map((item) => (
              <li key={item} className="flex gap-3 rounded-2xl bg-muted/70 p-4 text-sm leading-relaxed text-foreground text-pretty">
                <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-secondary" aria-hidden="true" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </aside>
      </div>
    </section>

    <section className="container mx-auto max-w-6xl px-4 py-16 md:py-24">
      <div className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Self-service support</p>
        <h2 className="mt-3 font-headline text-3xl font-bold text-foreground text-balance md:text-4xl">
          Start with the topic closest to your question
        </h2>
        <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
          These public guides work without an account and cover the most common setup, workflow, and plan questions.
        </p>
      </div>

      <div className="mt-10 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {SUPPORT_TOPICS.map((topic) => {
          const Icon = topicIcons[topic.id];
          return (
            <article
              key={topic.id}
              className="flex min-h-64 flex-col rounded-2xl bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] transition-[box-shadow,transform] duration-150 hover:-translate-y-0.5 hover:shadow-[0_0_0_1px_rgba(0,0,0,0.08),0_1px_2px_-1px_rgba(0,0,0,0.08),0_8px_20px_rgba(0,0,0,0.08)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)]"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <h3 className="mt-5 text-xl font-semibold text-foreground text-balance">{topic.title}</h3>
              <p className="mt-3 flex-1 text-sm leading-relaxed text-muted-foreground text-pretty">{topic.description}</p>
              <Link
                to={topic.href}
                className="group mt-5 inline-flex min-h-11 items-center gap-2 font-semibold text-primary transition-[color,transform] duration-150 active:scale-[0.96]"
              >
                {topic.cta}
                <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
              </Link>
            </article>
          );
        })}
      </div>
    </section>

    <section className="border-y border-border bg-muted/35 py-16 md:py-24">
      <div className="container mx-auto grid max-w-6xl gap-8 px-4 lg:grid-cols-[1fr_0.9fr] lg:items-center">
        <div className="max-w-2xl">
          <p className="text-sm font-semibold uppercase tracking-wide text-primary">Contact support</p>
          <h2 className="mt-3 font-headline text-3xl font-bold text-foreground text-balance md:text-4xl">
            Still stuck? Send us the details.
          </h2>
          <p className="mt-4 text-lg leading-relaxed text-muted-foreground text-pretty">
            We handle account, billing, import, and product questions by email. Response time varies by plan and request complexity, so include the troubleshooting details above when you can.
          </p>
        </div>
        <div className="rounded-3xl bg-primary p-7 text-primary-foreground shadow-lg sm:p-8">
          <Mail className="h-8 w-8" aria-hidden="true" />
          <p className="mt-5 text-sm font-semibold uppercase tracking-wide text-primary-foreground/75">Support email</p>
          <a
            href={SUPPORT_PAGE.emailHref}
            className="mt-2 block break-all font-headline text-2xl font-semibold text-primary-foreground underline decoration-primary-foreground/35 underline-offset-4 hover:decoration-primary-foreground"
          >
            {SUPPORT_PAGE.email}
          </a>
          <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80 text-pretty">
            Never send passwords, access tokens, private keys, or payment-card details in a support email.
          </p>
        </div>
      </div>
    </section>

    <section className="container mx-auto max-w-4xl px-4 py-16 md:py-24">
      <p className="text-sm font-semibold uppercase tracking-wide text-primary">Frequently asked questions</p>
      <h2 className="mt-3 font-headline text-3xl font-bold text-foreground text-balance md:text-4xl">
        Support questions, answered plainly
      </h2>
      <div className="mt-8 divide-y divide-border rounded-3xl bg-card px-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] sm:px-8">
        {SUPPORT_FAQS.map((faq) => (
          <details key={faq.q} className="group py-5">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 text-left text-lg font-semibold text-foreground marker:content-none">
              <span className="text-balance">{faq.q}</span>
              <span aria-hidden="true" className="text-xl font-normal text-primary transition-transform duration-150 group-open:rotate-45">+</span>
            </summary>
            <p className="max-w-3xl pb-2 pt-3 leading-relaxed text-muted-foreground text-pretty">{faq.a}</p>
          </details>
        ))}
      </div>

      <aside className="mt-8 flex gap-4 rounded-2xl bg-amber-500/10 p-5 text-amber-950 ring-1 ring-amber-500/20 dark:text-amber-100">
        <ShieldAlert className="mt-0.5 h-6 w-6 shrink-0" aria-hidden="true" />
        <div>
          <h3 className="font-semibold text-balance">For immediate hazards, use your emergency procedure</h3>
          <p className="mt-2 text-sm leading-relaxed text-pretty">
            MaintenEase support does not monitor equipment or dispatch emergency services. Contact the appropriate site lead or local service for urgent safety, fire, medical, utility, or equipment hazards.
          </p>
        </div>
      </aside>
    </section>
  </MarketingLayout>
);

export default SupportPage;
