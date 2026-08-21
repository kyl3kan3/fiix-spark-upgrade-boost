import { comparisons } from "./comparisons";
import { glossary } from "./glossary";
import { maintenanceTemplates } from "./maintenanceTemplates";
import { MCP_PAGE } from "./mcpPage";
import { PRODUCT_LAST_MODIFIED } from "./productCatalog";
import { solutions } from "./solutions";
import { SECOND_PASS_TOOL_PAGES } from "./secondPassTools";

export interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

const latestDate = (dates: Array<string | undefined>): string | undefined =>
  dates.filter((date): date is string => Boolean(date)).sort().at(-1);

const learnLastmod = latestDate(glossary.map((entry) => entry.updated ?? entry.published));
const templatesLastmod = latestDate(maintenanceTemplates.map((entry) => entry.updated ?? entry.published));

/**
 * Canonical, non-blog URLs submitted to search engines.
 *
 * `lastmod` is present only when the date is backed by page data or a known
 * content change. Do not replace these values with a build timestamp.
 */
export const STATIC_SITEMAP_ENTRIES: SitemapEntry[] = [
  { path: "/", lastmod: "2026-08-14", changefreq: "weekly", priority: "1.0" },
  {
    path: "/maintenance-simplified",
    lastmod: "2026-08-14",
    changefreq: "monthly",
    priority: "0.8",
  },
  {
    path: "/facility-management",
    lastmod: "2026-08-16",
    changefreq: "monthly",
    priority: "0.9",
  },
  { path: "/pricing", lastmod: PRODUCT_LAST_MODIFIED, changefreq: "monthly", priority: "0.9" },
  { path: "/features", lastmod: PRODUCT_LAST_MODIFIED, changefreq: "monthly", priority: "0.8" },
  { path: "/mcp", lastmod: MCP_PAGE.updated, changefreq: "monthly", priority: "0.9" },
  { path: "/solutions", changefreq: "weekly", priority: "0.9" },
  { path: "/learn", lastmod: learnLastmod, changefreq: "weekly", priority: "0.8" },
  { path: "/blog", changefreq: "daily", priority: "0.8" },
  { path: "/support", lastmod: "2026-08-15", changefreq: "monthly", priority: "0.6" },
  { path: "/about", lastmod: "2026-08-21", changefreq: "yearly", priority: "0.5" },
  { path: "/editorial-policy", lastmod: "2026-08-21", changefreq: "yearly", priority: "0.4" },
  { path: "/privacy", changefreq: "yearly", priority: "0.3" },
  { path: "/terms", changefreq: "yearly", priority: "0.3" },
  { path: "/refund-policy", changefreq: "yearly", priority: "0.3" },
  { path: "/sms-opt-in", changefreq: "yearly", priority: "0.2" },
  ...solutions.map((solution) => ({
    path: `/solutions/${solution.slug}`,
    lastmod: solution.slug === "preventive-maintenance-software" ? "2026-08-14" : undefined,
    changefreq: "monthly" as const,
    priority: "0.8",
  })),
  ...glossary.map((entry) => ({
    path: `/learn/${entry.slug}`,
    lastmod: entry.updated ?? entry.published,
    changefreq: "monthly" as const,
    priority: "0.7",
  })),
  { path: "/compare", changefreq: "monthly", priority: "0.8" },
  { path: "/cmms-cost-calculator", changefreq: "monthly", priority: "0.8" },
  ...SECOND_PASS_TOOL_PAGES.map((page) => ({
    path: page.path,
    lastmod: page.updated,
    changefreq: "monthly" as const,
    priority: "0.8",
  })),
  ...comparisons.map((comparison) => ({
    path: `/compare/${comparison.slug}`,
    changefreq: "monthly" as const,
    priority: "0.8",
  })),
  { path: "/templates", lastmod: templatesLastmod, changefreq: "monthly", priority: "0.8" },
  ...maintenanceTemplates.map((template) => ({
    path: `/templates/${template.slug}`,
    lastmod: template.updated ?? template.published,
    changefreq: "monthly" as const,
    priority: "0.8",
  })),
];
