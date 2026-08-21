import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import {
  PRODUCT_CONTACT_EMAIL,
  PRODUCT_OPERATOR_NAME,
  PRODUCT_SUPPORT_SUMMARY,
} from "@/data/productCatalog";

const CANONICAL = "https://maintenease.com/about";

export default function AboutPage() {
  return (
    <MarketingLayout>
      <Helmet>
        <title>About MaintenEase — Product, Operator, and Contact</title>
        <meta name="description" content="Learn what MaintenEase does, who operates the service, how product information is maintained, and how to contact the team." />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="About MaintenEase" />
        <meta property="og:description" content="MaintenEase product, operator, contact, and publishing information." />
        <meta property="og:url" content={CANONICAL} />
      </Helmet>
      <MarketingJsonLd />
      <main className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <p className="text-sm font-semibold uppercase tracking-wide text-primary">Company information</p>
        <h1 className="mt-3 font-headline text-4xl font-bold text-foreground text-balance md:text-5xl">About MaintenEase</h1>
        <p className="mt-5 max-w-3xl text-lg leading-relaxed text-muted-foreground text-pretty">
          MaintenEase is cloud maintenance management software for work orders, assets, preventive maintenance, inspections, reporting, and equipment-risk workflows. The service and this website are operated by {PRODUCT_OPERATOR_NAME}.
        </p>

        <div className="mt-12 grid gap-6 md:grid-cols-2">
          <section className="rounded-2xl bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
            <h2 className="font-headline text-2xl font-semibold text-foreground text-balance">What the product is for</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">Maintenance and facility teams use MaintenEase to capture requests, plan and complete work, keep asset history, schedule recurring maintenance, run inspections, and review operational records.</p>
          </section>
          <section className="rounded-2xl bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)]">
            <h2 className="font-headline text-2xl font-semibold text-foreground text-balance">Published product facts</h2>
            <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">Current plan prices, included seats, record limits, trial terms, and support channels come from one maintained product catalog. {PRODUCT_SUPPORT_SUMMARY}</p>
            <Link to="/pricing" className="mt-4 inline-flex min-h-11 items-center font-semibold text-primary underline underline-offset-4">Review current plans</Link>
          </section>
        </div>

        <section className="mt-12 rounded-2xl bg-muted/50 p-6 md:p-8">
          <h2 className="font-headline text-2xl font-semibold text-foreground text-balance">Contact and accountability</h2>
          <p className="mt-3 leading-relaxed text-muted-foreground text-pretty">Product and support questions can be sent to <a className="font-medium text-primary underline underline-offset-4" href={`mailto:${PRODUCT_CONTACT_EMAIL}`}>{PRODUCT_CONTACT_EMAIL}</a>. MaintenEase does not publish unverified customer counts, ratings, staff credentials, or social profiles.</p>
          <div className="mt-5 flex flex-wrap gap-5">
            <Link to="/support" className="font-semibold text-primary underline underline-offset-4">Get support</Link>
            <Link to="/editorial-policy" className="font-semibold text-primary underline underline-offset-4">Read the editorial policy</Link>
            <Link to="/terms" className="font-semibold text-primary underline underline-offset-4">Terms of service</Link>
          </div>
        </section>
      </main>
    </MarketingLayout>
  );
}
