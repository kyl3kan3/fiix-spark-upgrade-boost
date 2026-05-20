import { Link } from "react-router-dom";
import { solutions } from "@/data/solutions";
import { glossary } from "@/data/glossary";

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
 <div className="grid gap-12 md:grid-cols-2">
 <div>
 <h2 className="mb-4 text-2xl font-semibold text-foreground">
 Solutions
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
 Learn
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
 </div>
 </div>
 </section>
 );
};

export default SiteIndexLinks;