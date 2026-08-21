import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import { PRODUCT_CONTACT_EMAIL } from "@/data/productCatalog";

const CANONICAL = "https://maintenease.com/editorial-policy";

const sections = [
  ["How guides are prepared", "The MaintenEase editorial team defines the reader's maintenance decision, checks terminology against primary or authoritative technical sources where available, and separates product facts from general operating guidance. Pages show their publication or substantive-update date when the underlying page data supports one."],
  ["Product and competitor claims", "MaintenEase plan prices, seats, limits, trial terms, and support channels are generated from the product catalog. Time-sensitive competitor facts are linked to the vendor's official page and carry a verification date. Quote-only pricing is not converted into estimated savings."],
  ["Evidence and calculations", "Worked examples are labeled as examples and use reader-supplied or explicitly stated assumptions. MaintenEase does not describe internal customer data as research unless a real cohort, period, method, limitations, and auditable evidence can be published."],
  ["Safety and professional scope", "Maintenance guides are general educational material, not a substitute for an employer's hazard assessment, energy-control program, manufacturer instructions, qualified-person requirements, engineering judgment, or applicable law. Stop work when safe conditions, authorization, or required information are missing."],
  ["Corrections and updates", `Substantive corrections update the page date and generated Markdown copy. Send a specific correction, source, or product-policy question to ${PRODUCT_CONTACT_EMAIL}.`],
] as const;

export default function EditorialPolicyPage() {
  return (
    <MarketingLayout>
      <Helmet>
        <title>MaintenEase Editorial Policy and Content Methodology</title>
        <meta name="description" content="How MaintenEase prepares, sources, reviews, dates, and corrects maintenance guides, product facts, comparisons, and calculations." />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="MaintenEase Editorial Policy" />
        <meta property="og:description" content="Sourcing, review, corrections, comparisons, calculations, and safety scope." />
        <meta property="og:url" content={CANONICAL} />
      </Helmet>
      <MarketingJsonLd />
      <main className="container mx-auto max-w-3xl px-4 py-12 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Last reviewed August 21, 2026</p>
        <h1 className="mt-3 font-headline text-4xl font-bold text-foreground text-balance md:text-5xl">Editorial policy and methodology</h1>
        <p className="mt-5 text-lg leading-relaxed text-muted-foreground text-pretty">This policy explains how MaintenEase publishes useful maintenance education without inventing experience, research, customer evidence, reviews, or credentials.</p>
        <div className="mt-12 space-y-10">
          {sections.map(([heading, body]) => (
            <section key={heading}>
              <h2 className="font-headline text-2xl font-semibold text-foreground text-balance">{heading}</h2>
              <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">{body}</p>
            </section>
          ))}
        </div>
        <aside className="mt-12 rounded-2xl bg-muted/50 p-6">
          <h2 className="font-headline text-xl font-semibold text-foreground">Who reviews the content?</h2>
          <p className="mt-2 leading-relaxed text-muted-foreground text-pretty">The published reviewer is currently the MaintenEase editorial team as an organizational author. No individual reviewer, biography, or professional credential is published until the owner verifies those facts.</p>
          <Link to="/about" className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4">About the product and operator</Link>
        </aside>
      </main>
    </MarketingLayout>
  );
}
