import { ArrowRight, CheckCircle2, XCircle, Activity, CalendarClock, History, SearchCheck } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Problem → solved narrative for the homepage.
 *
 * Visitors need to see the problem MaintenEase solves (surprise breakdowns,
 * scattered work orders) and the solved state side by side, plus the concrete
 * predictive metrics that make the "solved" claim credible. The metrics listed
 * here describe real product behavior (risk scoring engine, 6-hour recompute,
 * MTBF from logged failures, explainable factor breakdown) — keep them in sync
 * with the predictive maintenance feature if the engine changes.
 */

const before = [
  "Breakdowns are discovered when something stops working",
  "Work orders live in texts, paper, and someone's memory",
  "No history when a machine fails — just guesses",
  "Emergency vendor rates and overtime to catch back up",
];

const after = [
  "Every asset carries a live 0–100 failure-risk score",
  "Rising risk becomes a scheduled work order before the breakdown",
  "Full asset history, readings, and costs in one place",
  "The crew plans the week instead of chasing it",
];

const metrics = [
  {
    icon: Activity,
    label: "Failure-risk score",
    detail: "0–100 per asset, recomputed every 6 hours",
  },
  {
    icon: CalendarClock,
    label: "Predicted failure date",
    detail: "Forecast window plus remaining useful life",
  },
  {
    icon: History,
    label: "MTBF & failure history",
    detail: "Learned automatically from every logged failure",
  },
  {
    icon: SearchCheck,
    label: "Top risk driver",
    detail: "Shows why an asset is flagged — no black box",
  },
];

const ProblemSolved = () => {
  const navigate = useNavigate();

  return (
    <section className="py-20 bg-background">
      <div className="container mx-auto px-4">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-4">
            The surprise-breakdown problem, solved.
          </h2>
          <p className="text-lg text-muted-foreground">
            Most teams find out about failures when the equipment stops.
            MaintenEase flips that: it watches your assets and flags trouble
            while it's still a cheap fix.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
          <div className="rounded-xl border border-border bg-card p-8">
            <h3 className="text-sm font-bold uppercase tracking-wide text-muted-foreground mb-5">
              Without MaintenEase
            </h3>
            <ul className="space-y-4">
              {before.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-muted-foreground">
                  <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive/70" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-primary/30 bg-primary/5 p-8 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wide text-primary mb-5">
              With MaintenEase
            </h3>
            <ul className="space-y-4">
              {after.map((item) => (
                <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                  <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0 text-success" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="max-w-5xl mx-auto mt-10">
          <p className="text-center text-sm font-semibold uppercase tracking-wide text-muted-foreground mb-5">
            The predictive metrics behind it
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {metrics.map((m) => (
              <div key={m.label} className="rounded-lg border border-border bg-card p-4">
                <m.icon className="h-5 w-5 text-primary mb-2" />
                <div className="text-sm font-semibold text-foreground">{m.label}</div>
                <div className="text-xs text-muted-foreground mt-1 leading-relaxed">{m.detail}</div>
              </div>
            ))}
          </div>
          <div className="mt-6 text-center">
            <button
              type="button"
              onClick={() => navigate("/feature/Predictive Maintenance")}
              className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary hover:underline"
            >
              See how predictive maintenance works
              <ArrowRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default ProblemSolved;
