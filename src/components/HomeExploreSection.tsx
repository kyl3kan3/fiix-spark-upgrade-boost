import { Link } from "react-router-dom";

const EXPLORE_LINKS = [
  { href: "/features", label: "CMMS features", blurb: "Work orders, assets, PM schedules, and mobile access." },
  { href: "/solutions", label: "Solutions by industry", blurb: "Facility, fleet, preventive maintenance, and request portals." },
  { href: "/pricing", label: "Pricing", blurb: "Starter $49, Pro $129, and Business $299 per month." },
  { href: "/learn", label: "Maintenance guides", blurb: "CMMS, preventive maintenance, work orders, and reliability terms." },
  { href: "/templates", label: "Free templates", blurb: "Logs, PM checklists, work orders, and safety worksheets." },
  { href: "/compare", label: "Compare CMMS vendors", blurb: "Honest pricing comparisons with published team-cost math." },
] as const;

/** Short discovery links instead of full site directories on the homepage. */
const HomeExploreSection = () => (
  <section aria-label="Explore MaintenEase" className="border-t border-border bg-muted/30 py-16">
    <div className="container mx-auto px-4">
      <h2 className="font-headline text-center text-2xl font-bold text-foreground md:text-3xl">Go deeper</h2>
      <p className="mx-auto mt-3 max-w-2xl text-center text-muted-foreground">
        The homepage stays focused on CMMS essentials. Use these hubs for full feature lists, guides, and downloads.
      </p>
      <ul className="mx-auto mt-10 grid max-w-5xl gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {EXPLORE_LINKS.map((item) => (
          <li key={item.href} className="rounded-xl border border-border bg-card p-5">
            <Link to={item.href} className="font-semibold text-primary hover:underline">
              {item.label}
            </Link>
            <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.blurb}</p>
          </li>
        ))}
      </ul>
      <p className="mt-8 text-center text-sm text-muted-foreground">
        Also:{" "}
        <Link to="/mcp" className="font-medium text-primary hover:underline">
          MCP server for AI clients
        </Link>
        {" · "}
        <Link to="/tools/mtbf-calculator" className="font-medium text-primary hover:underline">
          MTBF calculator
        </Link>
      </p>
    </div>
  </section>
);

export default HomeExploreSection;