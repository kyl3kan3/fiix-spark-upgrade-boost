import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import MarketingPrimaryCta from "@/components/marketing/MarketingPrimaryCta";
import MarketingJsonLd from "@/components/marketing/MarketingJsonLd";
import { SITE_ORIGIN, buildItemListJsonLd } from "@/data/productCatalog";
import {
  LOWEST_LISTED_SUMMARY,
  SMALL_BUSINESS_CMMS_FAQS,
  SMALL_BUSINESS_CMMS_OPTIONS,
  SMALL_BUSINESS_CMMS_PATH,
  SMALL_BUSINESS_CMMS_PUBLISHED,
  SMALL_BUSINESS_CMMS_UPDATED,
  SMALL_BUSINESS_TEAM_SIZES,
  TEAM_COST_ROWS,
} from "@/data/smallBusinessCmms";

const url = `${SITE_ORIGIN}${SMALL_BUSINESS_CMMS_PATH}`;
const title = "Best CMMS Software for Small Business 2026: Real Prices";
const description =
  "Six CMMS options for small maintenance teams compared on published pricing, seat rules and fit, with monthly cost for 4, 8 and 12 users.";

const formatDate = (iso: string) =>
  new Date(`${iso}T00:00:00Z`).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

const itemListLd = buildItemListJsonLd(
  "CMMS software options for small businesses",
  url,
  SMALL_BUSINESS_CMMS_OPTIONS.map((option) => ({
    name: option.name,
    url: option.compareHref ? `${SITE_ORIGIN}${option.compareHref}` : `${SITE_ORIGIN}/pricing`,
    description: option.fits,
  })),
);

const faqLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: SMALL_BUSINESS_CMMS_FAQS.map((faq) => ({
    "@type": "Question",
    name: faq.q,
    acceptedAnswer: { "@type": "Answer", text: faq.a },
  })),
};

const breadcrumbLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Compare", item: `${SITE_ORIGIN}/compare` },
    { "@type": "ListItem", position: 2, name: "Best CMMS for small business", item: url },
  ],
};

const webPageLd = {
  "@context": "https://schema.org",
  "@type": "WebPage",
  name: title,
  url,
  description,
  datePublished: SMALL_BUSINESS_CMMS_PUBLISHED,
  dateModified: SMALL_BUSINESS_CMMS_UPDATED,
};

const BestCmmsSmallBusinessPage = () => (
  <MarketingLayout>
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="article" />
      <meta property="og:image" content="https://maintenease.com/og-image.png?v=5" />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=5" />
      <script type="application/ld+json">{JSON.stringify(webPageLd)}</script>
      <script type="application/ld+json">{JSON.stringify(itemListLd)}</script>
      <script type="application/ld+json">{JSON.stringify(faqLd)}</script>
      <script type="application/ld+json">{JSON.stringify(breadcrumbLd)}</script>
    </Helmet>
    <MarketingJsonLd />

    <article className="container mx-auto px-4 py-12 md:py-16 max-w-4xl">
      <nav className="text-sm text-muted-foreground mb-6">
        <Link to="/compare" className="hover:text-primary transition-colors">Compare</Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">Best CMMS for small business</span>
      </nav>
      <h1 className="font-headline text-4xl md:text-5xl font-bold tracking-normal mb-4 text-foreground">
        Best CMMS software for small business in 2026
      </h1>
      <p className="text-lg text-muted-foreground">
        A small maintenance team mostly needs three things from a CMMS: work orders, preventive maintenance
        schedules and asset history, at a price that does not climb every time someone new needs a login. This
        page compares six options on what each vendor publishes about price and seats.
      </p>
      <p className="mt-4 text-sm text-muted-foreground">
        Last updated {formatDate(SMALL_BUSINESS_CMMS_UPDATED)}. MaintenEase publishes this page and is one of the
        six products on it. Read our <Link to="/editorial-policy" className="text-primary hover:underline">editorial policy</Link>.
      </p>

      <h2 className="font-headline text-2xl font-bold mt-12 mb-4 text-foreground">The short answer</h2>
      <ul className="space-y-2 text-foreground list-disc pl-5">
        <li>Lowest listed price in the table below: {LOWEST_LISTED_SUMMARY}.</li>
        <li>
          MaintenEase is priced per account, so the bill steps up at five seats and then grows by $15 for each
          added person. Per-user vendors charge the full per-user price for each added person.
        </li>
        <li>Plan tiers differ in what they include, so check the tier before you compare on price alone.</li>
        <li>Quote-only vendors: get the all-in total in writing before you compare.</li>
      </ul>

      <h2 className="font-headline text-2xl font-bold mt-12 mb-4 text-foreground">
        Monthly cost for {SMALL_BUSINESS_TEAM_SIZES.join(", ").replace(/, (\d+)$/, " and $1")} users
      </h2>
      <div className="overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm tabular-nums">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th scope="col" className="p-3 font-semibold">CMMS</th>
              {SMALL_BUSINESS_TEAM_SIZES.map((size) => (
                <th key={size} scope="col" className="p-3 font-semibold">{size} users</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {TEAM_COST_ROWS.map((row) => (
              <tr key={row.name} className="border-t border-border">
                <th scope="row" className="p-3 text-left font-medium text-foreground">{row.name}</th>
                {row.costs.map((cost, index) => (
                  <td key={SMALL_BUSINESS_TEAM_SIZES[index]} className="p-3">
                    {cost === null ? "Quote required" : `$${cost}/mo`}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-sm text-muted-foreground">
        Per-user rows multiply the listed per-user price used on each vendor's comparison page by the team size.
        Those plans are not equivalent in features.
        The MaintenEase row is the lowest published plan whose seats cover the team. Asset or work-order volume
        can require a higher plan. Prices exclude tax and any vendor add-ons.
      </p>

      <h2 className="font-headline text-2xl font-bold mt-12 mb-4 text-foreground">The six options</h2>
      <div className="space-y-6">
        {SMALL_BUSINESS_CMMS_OPTIONS.map((option) => (
          <section key={option.name} className="rounded-lg border border-border bg-card p-6">
            <h3 className="text-xl font-semibold text-foreground">{option.name}</h3>
            <p className="mt-2 text-foreground"><span className="font-semibold">Fits:</span> {option.fits}</p>
            <p className="mt-2 text-muted-foreground">{option.pricingSummary}</p>
            <p className="mt-3 text-sm text-muted-foreground">
              Source:{" "}
              <a href={option.sourceUrl} rel="nofollow noopener" target="_blank" className="text-primary hover:underline">
                {option.sourceLabel}
              </a>
              , checked {formatDate(option.verifiedOn)}.
              {option.compareHref && (
                <>
                  {" "}
                  <Link to={option.compareHref} className="text-primary hover:underline">
                    MaintenEase vs {option.name}
                  </Link>
                </>
              )}
            </p>
          </section>
        ))}
      </div>

      <h2 className="font-headline text-2xl font-bold mt-12 mb-4 text-foreground">Questions small teams ask</h2>
      <dl className="space-y-6">
        {SMALL_BUSINESS_CMMS_FAQS.map((faq) => (
          <div key={faq.q}>
            <dt className="font-semibold text-foreground">{faq.q}</dt>
            <dd className="mt-2 text-muted-foreground">{faq.a}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-12 flex flex-col items-center gap-6">
        <Link to="/cmms-cost-calculator" className="font-semibold text-primary hover:underline">
          Run the numbers for your own team size
        </Link>
        <MarketingPrimaryCta />
      </div>
    </article>
  </MarketingLayout>
);

export default BestCmmsSmallBusinessPage;
