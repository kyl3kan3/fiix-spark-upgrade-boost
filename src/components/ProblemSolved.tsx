import { CheckCircle2, XCircle, Activity, CalendarClock, History, SearchCheck } from "lucide-react";
import { buildHomeRiskSampleWorkflow } from "@/data/homeRiskSample";

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
  { icon: Activity, label: "Failure-risk score" },
  { icon: CalendarClock, label: "Predicted failure date" },
  { icon: History, label: "MTBF & failure history" },
  { icon: SearchCheck, label: "Top risk driver" },
];

const scoreInputsLine =
  "The failure-risk score uses the asset's age, failure history, open work orders, and condition readings.";

const ProblemSolved = () => {
  const sampleWorkflow = buildHomeRiskSampleWorkflow();

  return (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-12 text-center max-w-3xl mx-auto">
        The surprise-breakdown problem, solved
      </h2>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <div className="h-full rounded-xl border border-border bg-card p-8">
          <h3 className="text-lg font-semibold text-foreground mb-5">Without MaintenEase</h3>
          <ul className="space-y-4">
            {before.map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-foreground">
                <XCircle className="h-4 w-4 mt-0.5 shrink-0 text-destructive/70" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="h-full rounded-xl border border-primary/30 bg-primary/5 p-8 shadow-sm">
          <h3 className="text-lg font-semibold text-primary mb-5">With MaintenEase</h3>
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

      <p className="max-w-3xl mx-auto mt-10 text-center text-sm text-foreground">{scoreInputsLine}</p>

      <div className="max-w-5xl mx-auto mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="h-full rounded-lg border border-border bg-card p-4 flex items-center gap-3">
            <m.icon className="h-5 w-5 text-primary shrink-0" />
            <div className="text-sm font-semibold text-foreground">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="max-w-3xl mx-auto mt-10 rounded-xl border border-border bg-card p-6">
        <h3 className="text-base font-semibold text-foreground mb-4">Sample predicted-failure workflow</h3>
        <ol className="space-y-3">
          {sampleWorkflow.map((row) => (
            <li key={row.step} className="text-sm">
              <span className="font-medium text-foreground">{row.step}: </span>
              <span className="text-foreground">{row.detail}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </section>
  );
};

export default ProblemSolved;