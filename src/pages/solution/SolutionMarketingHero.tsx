import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SolutionRoutePayload } from "@/lib/solutionRoutePayload";
import {
  MARKETING_BREADCRUMB_LINK_CLASS,
  MARKETING_BREADCRUMB_NAV_CLASS,
  MARKETING_HERO_CTA_WRAP_CLASS,
  MARKETING_HERO_PRIMARY_CTA_LINK_CLASS,
  SOLUTION_HERO_BREADCRUMB,
  SOLUTION_PAGE_HERO_H1_CLASS,
  SOLUTION_PAGE_INTRO_CLASS,
} from "@/lib/marketingPrerenderShell";

export function SolutionMarketingHero({ solution }: { solution: SolutionRoutePayload }) {
  return (
    <section className="container mx-auto px-4 py-12 md:py-20 max-w-5xl">
      <nav className={MARKETING_BREADCRUMB_NAV_CLASS}>
        <Link to={SOLUTION_HERO_BREADCRUMB.href} className={MARKETING_BREADCRUMB_LINK_CLASS}>
          {SOLUTION_HERO_BREADCRUMB.label}
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{solution.name}</span>
      </nav>
      <h1 className={SOLUTION_PAGE_HERO_H1_CLASS}>{solution.h1}</h1>
      <p className={SOLUTION_PAGE_INTRO_CLASS}>{solution.intro}</p>
      <div className={MARKETING_HERO_CTA_WRAP_CLASS}>
        <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary-variant font-semibold shadow-md">
          <Link to="/auth?signup=true" className={MARKETING_HERO_PRIMARY_CTA_LINK_CLASS}>
            Start free trial <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </div>
    </section>
  );
}