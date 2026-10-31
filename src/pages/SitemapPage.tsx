import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import MarketingLayout from "@/components/marketing/MarketingLayout";
import { GENERATED_INDEXABLE_ROUTES } from "@/data/generatedIndexableRoutes";

const TITLE = "Sitemap | MaintenEase";
const DESCRIPTION =
  "HTML sitemap of every public MaintenEase page: product, solutions, learn guides, templates, tools, blog posts, and legal policies.";
const CANONICAL = "https://maintenease.com/sitemap";

function labelForPath(path: string): string {
  if (path === "/") return "Home";
  const segments = path.replace(/^\//, "").split("/");
  const last = segments[segments.length - 1] ?? path;
  return last
    .split("-")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

const groupedRoutes = (() => {
  const groups = new Map<string, string[]>();
  for (const path of GENERATED_INDEXABLE_ROUTES) {
    const key = path === "/" ? "Home" : path.split("/").filter(Boolean)[0] ?? "Other";
    const list = groups.get(key) ?? [];
    list.push(path);
    groups.set(key, list);
  }
  return [...groups.entries()].sort(([a], [b]) => a.localeCompare(b));
})();

export default function SitemapPage() {
  return (
    <MarketingLayout>
      <Helmet>
        <title>{TITLE}</title>
        <meta name="description" content={DESCRIPTION} />
        <link rel="canonical" href={CANONICAL} />
        <meta property="og:title" content={TITLE} />
        <meta property="og:description" content={DESCRIPTION} />
        <meta property="og:url" content={CANONICAL} />
        <meta property="og:type" content="website" />
        <meta property="og:image" content="https://maintenease.com/og-image.png?v=4" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={TITLE} />
        <meta name="twitter:description" content={DESCRIPTION} />
        <meta name="twitter:image" content="https://maintenease.com/og-image.png?v=4" />
      </Helmet>

      <div className="container mx-auto max-w-4xl px-4 py-12 md:py-16">
        <h1 className="text-4xl font-bold tracking-normal mb-4">Sitemap</h1>
        <p className="text-lg text-muted-foreground mb-10 max-w-2xl">
          Every public page on MaintenEase, including marketing content, tools, blog posts, and legal
          policies. For search engines, see{" "}
          <a className="underline underline-offset-2" href="/sitemap.xml">
            sitemap.xml
          </a>
          .
        </p>

        <div className="space-y-10">
          {groupedRoutes.map(([group, paths]) => (
            <section key={group}>
              <h2 className="text-xl font-semibold mb-3 capitalize">{group.replace(/-/g, " ")}</h2>
              <ul className="grid gap-2 sm:grid-cols-2">
                {paths.sort().map((path) => (
                  <li key={path}>
                    <Link to={path} className="text-primary underline-offset-2 hover:underline">
                      {labelForPath(path)}
                    </Link>
                    <span className="text-muted-foreground text-sm ml-2">{path}</span>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </div>
    </MarketingLayout>
  );
}
