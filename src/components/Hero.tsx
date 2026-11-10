import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, CalendarDays, MapPin, User } from "lucide-react";
import { SIGNUP_PATH } from "@/data/signupRoute";
import { cn } from "@/lib/utils";

/** Illustrative work orders for the hero. Uses the app's own queue names. */
const QUEUE = [
  {
    id: "WO-1042",
    title: "Boiler 2 low-water cutoff test",
    asset: "Boiler room, Building B",
    who: "Dana R.",
    due: "Due today",
    lane: "Right away",
    tone: "bg-destructive/10 text-destructive border-destructive/30",
  },
  {
    id: "WO-1041",
    title: "Replace belt on AHU-04 supply fan",
    asset: "Roof, Building A",
    who: "Marcus T.",
    due: "Due Thu",
    lane: "Being worked on",
    tone: "bg-primary/10 text-primary border-primary/30",
  },
  {
    id: "WO-1038",
    title: "Grease conveyor C3 gearbox",
    asset: "Line 3",
    who: "Unassigned",
    due: "Due Mon",
    lane: "Up next",
    tone: "bg-warning/10 text-warning border-warning/30",
  },
];

const Hero = () => {
  const navigate = useNavigate();
  return (
    <header className="relative overflow-hidden bg-sidebar pb-16 pt-28 text-white md:pb-24 md:pt-36">
      <div className="container relative z-10 mx-auto max-w-7xl px-4">
        <div className="grid items-center gap-12 lg:grid-cols-[1.05fr_1fr]">
          <div>
            <h1 className="font-headline text-[2.75rem] font-bold leading-[1.02] text-white sm:text-6xl xl:text-7xl">
              CMMS Software for Facility &amp; Maintenance Teams
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-sidebar-foreground">
              Work orders, assets, inspections and preventive maintenance in one place, on the phone your
              technicians already carry.
            </p>

            <div className="mt-8 flex">
              <Button
                size="lg"
                className="w-full bg-highlight px-7 text-highlight-foreground hover:bg-highlight hover:brightness-95 focus-visible:ring-white focus-visible:ring-offset-sidebar sm:w-auto"
                onClick={() => navigate(SIGNUP_PATH)}
              >
                Start free trial
                <ArrowRight className="ml-1 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          {/* A work queue, drawn the way the app draws it. Decorative. */}
          <div aria-hidden className="relative mx-auto w-full max-w-xl">
            <div className="rounded-xl border border-sidebar-border bg-sidebar-accent p-3 sm:p-4">
              <div className="mb-3 flex items-center justify-between px-1">
                <span className="font-headline text-base font-semibold text-white">Today's work orders</span>
                <span className="text-sm tabular-nums text-sidebar-foreground">3 open</span>
              </div>
              <ul className="space-y-2.5">
                {QUEUE.map((wo) => (
                  <li
                    key={wo.id}
                    className="rounded-lg border border-border bg-card p-4 text-card-foreground shadow-md"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <div className="text-xs font-semibold tabular-nums text-muted-foreground">{wo.id}</div>
                        <div className="mt-0.5 font-headline text-lg font-semibold leading-snug">{wo.title}</div>
                      </div>
                      <span
                        className={cn(
                          "shrink-0 rounded-sm border px-2 py-0.5 text-xs font-semibold leading-5",
                          wo.tone,
                        )}
                      >
                        {wo.lane}
                      </span>
                    </div>
                    <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <span className="inline-flex items-center gap-1.5">
                        <MapPin className="h-3.5 w-3.5" />
                        {wo.asset}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <User className="h-3.5 w-3.5" />
                        {wo.who}
                      </span>
                      <span className="inline-flex items-center gap-1.5">
                        <CalendarDays className="h-3.5 w-3.5" />
                        {wo.due}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
