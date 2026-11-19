import { Helmet } from "react-helmet-async";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import type { SolutionRoutePayload } from "@/lib/solutionRoutePayload";
import type { Solution } from "@/data/solutions";

export function SolutionPageHead({ solution }: { solution: SolutionRoutePayload | Solution }) {
  const url = `https://maintenease.com/solutions/${solution.slug}`;
  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: solution.faqs.map((f) => ({
      "@type": "Question",
      name: f.q,
      acceptedAnswer: { "@type": "Answer", text: f.a },
    })),
  };
  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Solutions", item: "https://maintenease.com/solutions" },
      { "@type": "ListItem", position: 2, name: solution.name, item: url },
    ],
  };

  return (
    <>
      <Helmet>
        <title>{solution.metaTitle}</title>
        <meta name="description" content={solution.metaDescription} />
        <link rel="canonical" href={url} />
        <meta property="og:title" content={solution.metaTitle} />
        <meta property="og:description" content={solution.metaDescription} />
        <meta property="og:url" content={url} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://maintenease.com/og-image.png?v=5" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={solution.metaTitle} />
        <meta name="twitter:description" content={solution.metaDescription} />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=5" />
        <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
        <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
      </Helmet>
      <MarketingJsonLd />
    </>
  );
}