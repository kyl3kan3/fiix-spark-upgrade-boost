import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const badges = [
  {
    href: "https://verifieddr.com/website/maintenease-com",
    src: "https://verifieddr.com/badge/maintenease-com.svg?metric=truedr",
    alt: "Verified domain rating for maintenease.com",
    width: 220,
    height: 68,
  },
  {
    href: "https://startupbase.io/products/maintenease?utm_source=startupbase&utm_medium=badge&utm_campaign=launch-badge-light",
    src: "https://statics.startupbase.io/site/badges/launched-on-sb.svg",
    alt: "Launched on StartupBase",
    width: 185,
    height: 55,
  },
  {
    href: "https://saasgrow.app?ref=maintenease.com",
    src: "https://saasgrow.app/api/badge?type=featured&style=blue",
    alt: "MaintenEase featured on SaaSGrow",
    width: 240,
    height: 54,
  },
  {
    href: "https://www.foundrlist.com/product/maintenease?utm_source=badge&utm_medium=embed",
    src: "https://www.foundrlist.com/api/badge/maintenease",
    alt: "Featured on FoundrList",
    width: 150,
    height: 48,
  },
  {
    href: "https://findly.tools/maintenease?utm_source=maintenease",
    src: "https://findly.tools/badges/findly-tools-badge-light.svg",
    alt: "Featured on Findly.tools",
    width: 175,
    height: 55,
  },
  {
    href: "https://neeed.directory",
    src: "https://neeed.directory/badges/neeed-badge-light.svg",
    alt: "Featured on neeed.directory",
    width: 139,
    height: 44,
  },
  {
    href: "https://orynth.dev/projects/maintenease",
    src: "https://orynth.dev/api/badge/maintenease?theme=light&style=default",
    alt: "Featured on Orynth",
    width: 260,
    height: 80,
  },
  {
    href: "https://daniellaunches.com/tools/maintenease",
    src: "https://daniellaunches.com/badge.svg",
    alt: "Featured on DanielLaunches",
    width: 200,
    height: 44,
  },
] as const;

const alternativeGuides = [
  { label: "Fiix alternative", to: "/compare/maintenease-vs-fiix" },
  { label: "UpKeep alternative", to: "/compare/maintenease-vs-upkeep" },
  { label: "MaintainX alternative", to: "/compare/maintenease-vs-maintainx" },
  { label: "Limble alternative", to: "/compare/maintenease-vs-limble" },
  { label: "eMaint alternative", to: "/compare/maintenease-vs-emaint" },
] as const;

const TrustBadges = () => (
  <section
    aria-labelledby="trust-badges-heading"
    className="border-y border-border/70 bg-muted/30 py-12 md:py-16"
    data-testid="trust-badges"
  >
    <div className="container mx-auto max-w-6xl px-4">
      <h2 id="trust-badges-heading" className="font-display text-2xl font-bold text-foreground sm:text-3xl text-center mb-8">
        Directories &amp; comparisons
      </h2>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {badges.map((badge) => (
          <a
            key={badge.href}
            href={badge.href}
            target="_blank"
            rel="nofollow noopener noreferrer"
            className="flex min-h-24 items-center justify-center rounded-xl border border-border bg-card px-5 py-4 shadow-sm outline-none transition-[border-color,box-shadow,transform] duration-200 hover:border-primary/30 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 active:scale-[0.96]"
          >
            <span>{badge.alt}</span>
          </a>
        ))}
      </div>

      <nav
        aria-labelledby="alternative-guides-heading"
        className="mt-8 rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <h3 id="alternative-guides-heading" className="font-display text-lg font-semibold text-foreground mb-4">
          CMMS alternative guides
        </h3>

        <ul className="grid grid-cols-1 gap-x-6 sm:grid-cols-2 lg:grid-cols-5">
          {alternativeGuides.map((guide) => (
            <li key={guide.to}>
              <Link
                to={guide.to}
                className="flex min-h-10 items-center py-2 text-sm font-medium text-foreground outline-none transition-colors hover:text-primary focus-visible:rounded-sm focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              >
                {guide.label}
              </Link>
            </li>
          ))}
        </ul>

        <a
          href="https://freealternatives.net/"
          target="_blank"
          rel="nofollow noopener noreferrer"
          className="mt-4 inline-flex min-h-10 items-center gap-2 font-medium text-primary outline-none hover:text-primary/80 focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
        >
          FreeAlternatives.net
          <ExternalLink className="h-4 w-4" aria-hidden="true" />
        </a>
      </nav>
    </div>
  </section>
);

export default TrustBadges;
