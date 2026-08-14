import { ArrowRight, BookOpen, Bot } from "lucide-react";
import { Link } from "react-router-dom";
import { solutions } from "@/data/solutions";
import { glossary } from "@/data/glossary";
import { comparisons } from "@/data/comparisons";
import { maintenanceTemplates } from "@/data/maintenanceTemplates";
import { FEATURED_DISCOVERY_RESOURCES } from "@/data/seoResources";

/**
 * Internal-link block rendered on the homepage so Googlebot can discover
 * every solution and learn page directly from `/`. Helps new pages get
 * crawled and indexed faster than via sitemap alone.
 */
const SiteIndexLinks = () => {
 return (
 <section
 aria-label="Explore MaintenEase"
 className="border-t border-border bg-muted/30 py-16"
 >
 <div className="container mx-auto px-4">
 <div className="mb-10 flex flex-col gap-5 rounded-3xl bg-card p-6 shadow-[0_0_0_1px_rgba(0,0,0,0.06),0_1px_2px_-1px_rgba(0,0,0,0.06),0_2px_4px_rgba(0,0,0,0.04)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08)] sm:flex-row sm:items-center sm:justify-between sm:p-8">
 <div className="flex items-start gap-4">
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
 <Bot className="h-5 w-5" aria-hidden="true" />
 </div>
 <div>
 <h2 className="text-xl font-semibold text-foreground text-balance">Connect AI assistants through MaintenEase MCP</h2>
 <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground text-pretty">
 Discover OAuth-secured tools for work orders, assets, locations, and maintenance requests.
 </p>
 </div>
 </div>
 <Link
 to="/mcp"
 className="group inline-flex min-h-11 shrink-0 items-center gap-2 self-start rounded-xl bg-primary py-3 pl-5 pr-[18px] font-semibold text-primary-foreground shadow-sm transition-[background-color,box-shadow,transform] duration-150 hover:bg-primary/90 hover:shadow-md active:scale-[0.96] sm:self-auto"
 >
 Explore the MCP server
 <ArrowRight className="h-4 w-4 transition-transform duration-150 group-hover:translate-x-1" aria-hidden="true" />
 </Link>
 </div>
 <nav
 aria-label="Featured maintenance resources"
 className="mb-12 rounded-3xl border border-border bg-background p-6 sm:p-8"
 >
 <div className="mb-6 flex items-start gap-4">
 <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary/10 text-secondary">
 <BookOpen className="h-5 w-5" aria-hidden="true" />
 </div>
 <div>
 <h2 className="text-xl font-semibold text-foreground text-balance">Start with these maintenance resources</h2>
 <p className="mt-2 max-w-3xl text-sm leading-relaxed text-muted-foreground text-pretty">
 Practical guides and downloads for planning work, reducing backlog, and building a repeatable maintenance process.
 </p>
 </div>
 </div>
 <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
 {FEATURED_DISCOVERY_RESOURCES.map((resource) => (
 <li key={resource.href}>
 <Link
 to={resource.href}
 className="group block h-full rounded-2xl border border-border bg-card p-5 transition-[border-color,box-shadow,transform] duration-150 hover:border-primary/30 hover:shadow-md active:scale-[0.98]"
 >
 <span className="font-semibold text-foreground group-hover:text-primary">{resource.title}</span>
 <span className="mt-2 block text-sm leading-relaxed text-muted-foreground">{resource.description}</span>
 </Link>
 </li>
 ))}
 </ul>
 </nav>
 <div className="grid gap-12 md:grid-cols-2 xl:grid-cols-4">
 <div>
 <h2 className="mb-4 text-2xl font-semibold text-foreground">
 <Link to="/solutions" className="hover:text-primary hover:underline">Solutions</Link>
 </h2>
 <p className="mb-6 text-sm text-muted-foreground">
 Purpose-built workflows for every maintenance use case.
 </p>
 <ul className="grid gap-2 sm:grid-cols-2">
 {solutions.map((s) => (
 <li key={s.slug}>
 <Link
 to={`/solutions/${s.slug}`}
 className="text-sm text-foreground/80 hover:text-primary hover:underline"
 >
 {s.name}
 </Link>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h2 className="mb-4 text-2xl font-semibold text-foreground">
 <Link to="/templates" className="hover:text-primary hover:underline">Templates</Link>
 </h2>
 <p className="mb-6 text-sm text-muted-foreground">
 Free maintenance spreadsheets and checklists.
 </p>
 <ul className="grid gap-2">
 {maintenanceTemplates.map((template) => (
 <li key={template.slug}>
 <Link
 to={`/templates/${template.slug}`}
 className="text-sm text-foreground/80 hover:text-primary hover:underline"
 >
 {template.title}
 </Link>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h2 className="mb-4 text-2xl font-semibold text-foreground">
 <Link to="/learn" className="hover:text-primary hover:underline">Learn</Link>
 </h2>
 <p className="mb-6 text-sm text-muted-foreground">
 Plain-English guides to the concepts behind modern maintenance.
 </p>
 <ul className="grid gap-2 sm:grid-cols-2">
 {glossary.map((g) => (
 <li key={g.slug}>
 <Link
 to={`/learn/${g.slug}`}
 className="text-sm text-foreground/80 hover:text-primary hover:underline"
 >
 {g.term.split(" (")[0]}
 </Link>
 </li>
 ))}
 </ul>
 </div>

 <div>
 <h2 className="mb-4 text-2xl font-semibold text-foreground">
 <Link to="/compare" className="hover:text-primary hover:underline">Compare</Link>
 </h2>
 <p className="mb-6 text-sm text-muted-foreground">
 See how MaintenEase stacks up against other CMMS platforms.
 </p>
 <ul className="grid gap-2 sm:grid-cols-2">
 {comparisons.map((c) => (
 <li key={c.slug}>
 <Link
 to={`/compare/${c.slug}`}
 className="text-sm text-foreground/80 hover:text-primary hover:underline"
 >
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
};

export default SiteIndexLinks;
