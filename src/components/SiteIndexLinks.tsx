import { Link } from "react-router-dom";
import { solutions } from "@/data/solutions";
import { glossary } from "@/data/glossary";
import { comparisons } from "@/data/comparisons";
import { maintenanceTemplates } from "@/data/maintenanceTemplates";
import { FEATURED_DISCOVERY_RESOURCES } from "@/data/seoResources";

const SiteIndexLinks = () => (
  <section aria-label="Explore MaintenEase" className="border-t border-border bg-muted/30 py-16">
    <div className="container mx-auto px-4 space-y-12">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between rounded-2xl border border-border bg-card p-6">
        <h2 className="text-xl font-semibold text-foreground">MaintenEase MCP</h2>
        <Link to="/mcp" className="font-semibold text-primary hover:underline">
          MCP server
        </Link>
      </div>

      <nav aria-label="Featured maintenance resources">
        <h2 className="text-xl font-semibold text-foreground mb-4">Resources</h2>
        <ul className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {FEATURED_DISCOVERY_RESOURCES.map((resource) => (
            <li key={resource.href}>
              <Link to={resource.href} className="font-medium text-foreground hover:text-primary hover:underline">
                {resource.title}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
        <div>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            <Link to="/solutions" className="hover:text-primary hover:underline">
              Solutions
            </Link>
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {solutions.map((s) => (
              <li key={s.slug}>
                <Link to={`/solutions/${s.slug}`} className="text-sm text-foreground/80 hover:text-primary hover:underline">
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            <Link to="/templates" className="hover:text-primary hover:underline">
              Templates
            </Link>
          </h2>
          <ul className="grid gap-2">
            {maintenanceTemplates.map((template) => (
              <li key={template.slug}>
                <Link to={`/templates/${template.slug}`} className="text-sm text-foreground/80 hover:text-primary hover:underline">
                  {template.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            <Link to="/learn" className="hover:text-primary hover:underline">
              Learn
            </Link>
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {glossary.map((g) => (
              <li key={g.slug}>
                <Link to={`/learn/${g.slug}`} className="text-sm text-foreground/80 hover:text-primary hover:underline">
                  {g.term.split(" (")[0]}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h2 className="mb-4 text-2xl font-semibold text-foreground">
            <Link to="/compare" className="hover:text-primary hover:underline">
              Compare
            </Link>
          </h2>
          <ul className="grid gap-2 sm:grid-cols-2">
            {comparisons.map((c) => (
              <li key={c.slug}>
                <Link to={`/compare/${c.slug}`} className="text-sm text-foreground/80 hover:text-primary hover:underline">
                  {c.h1}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  </section>
);

export default SiteIndexLinks;
