import { CheckCircle2, XCircle, Activity, CalendarClock, History, SearchCheck } from "lucide-react";
import Reveal3D from "@/components/marketing/Reveal3D";

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

const ProblemSolved = () => (
  <section className="py-20 bg-background">
    <div className="container mx-auto px-4">
      <h2 className="font-headline text-3xl md:text-4xl font-bold text-foreground mb-12 text-center max-w-3xl mx-auto">
        The surprise-breakdown problem, solved
      </h2>

      <div className="grid md:grid-cols-2 gap-6 max-w-5xl mx-auto">
        <Reveal3D>
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
        </Reveal3D>

        <Reveal3D delayMs={140}>
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
        </Reveal3D>
      </div>

      <div className="max-w-5xl mx-auto mt-10 grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((m, index) => (
          <Reveal3D key={m.label} delayMs={index * 90}>
            <div className="h-full rounded-lg border border-border bg-card p-4 flex items-center gap-3">
              <m.icon className="h-5 w-5 text-primary shrink-0" />
              <div className="text-sm font-semibold text-foreground">{m.label}</div>
            </div>
          </Reveal3D>
        ))}
      </div>
    </div>
  </section>
);

export default ProblemSolved;
