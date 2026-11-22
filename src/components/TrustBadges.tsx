import { ExternalLink } from "lucide-react";
import { Link } from "react-router-dom";

const alternativeGuides = [
  { label: "Fiix alternative", to: "/compare/maintenease-vs-fiix" },
  { label: "UpKeep alternative", to: "/compare/maintenease-vs-upkeep" },
  { label: "MaintainX alternative", to: "/compare/maintenease-vs-maintainx" },
  { label: "Limble alternative", to: "/compare/maintenease-vs-limble" },
  { label: "eMaint alternative", to: "/compare/maintenease-vs-emaint" },
] as const;

const TrustBadges = () => (
  <section
    aria-labelledby="alternative-guides-heading"
    className="border-y border-border/70 bg-muted/30 py-12 md:py-16"
    data-testid="trust-badges"
  >
    <div className="container mx-auto max-w-6xl px-4">
      <nav
        aria-labelledby="alternative-guides-heading"
        className="rounded-xl border border-border bg-card p-5 shadow-sm sm:p-6"
      >
        <h2 id="alternative-guides-heading" className="font-display text-lg font-semibold text-foreground mb-4">
          CMMS alternative guides
        </h2>

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