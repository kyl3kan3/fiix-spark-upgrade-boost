import { ArrowRight, CheckCircle2, Zap, Menu, LayoutGrid, BarChart3 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <header className="relative pt-24 pb-32 overflow-hidden bg-background">
      {/* Abstract background blobs */}
      <div
        aria-hidden
        className="absolute top-0 right-0 -mr-32 -mt-32 w-96 h-96 rounded-full blur-3xl opacity-50"
        style={{ background: "hsl(var(--primary) / 0.08)" }}
      />
      <div
        aria-hidden
        className="absolute bottom-0 left-0 -ml-32 -mb-32 w-80 h-80 rounded-full blur-3xl opacity-50"
        style={{ background: "hsl(var(--secondary) / 0.08)" }}
      />

      <div className="container mx-auto px-4 max-w-7xl relative z-10">
        <div className="flex flex-col md:flex-row items-center gap-12">
          {/* Hero copy */}
          <div className="flex-1 text-center md:text-left space-y-8">
            <button
              type="button"
              onClick={() => navigate("/feature/Predictive Maintenance")}
              className="inline-flex items-center gap-2 px-3 py-1.5 bg-card border border-border rounded-full text-xs font-semibold text-primary shadow-sm cursor-pointer transition-colors hover:border-primary hover:bg-primary/5"
            >
              <Zap className="h-3.5 w-3.5 text-secondary" />
              New: AI-Powered Predictive Maintenance
              <ArrowRight className="h-3 w-3" />
            </button>

            <h1 className="font-headline text-4xl md:text-5xl xl:text-[3.25rem] font-bold leading-[1.1] text-foreground tracking-tight">
              Stop downtime
              <br />
              before it starts.
            </h1>

            <p className="text-lg text-muted-foreground max-w-xl mx-auto md:mx-0 leading-relaxed">
              MaintenEase helps industrial and facility teams catch issues before they become expensive interruptions.
            </p>

            <ul className="space-y-2 text-sm text-foreground max-w-xl mx-auto md:mx-0">
              <li className="flex items-start gap-2 justify-center md:justify-start">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                One flat price for your whole crew — not $45 per technician
              </li>
              <li className="flex items-start gap-2 justify-center md:justify-start">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                Predict failures before they cause costly downtime
              </li>
              <li className="flex items-start gap-2 justify-center md:justify-start">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                Free onboarding &amp; data import — live in days, not months
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-2">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary-variant px-8 shadow-md uppercase tracking-wide transition-all hover:-translate-y-0.5 active:scale-95 group"
                onClick={() => navigate("/auth?signup=true")}
              >
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
              <button
                type="button"
                onClick={() => navigate("/pricing")}
                className="text-sm font-semibold text-primary hover:underline"
              >
                See pricing
              </button>
            </div>
          </div>

          {/* Hero visual — simulated dashboard preview */}
          <div className="flex-1 w-full max-w-xl relative">
            <div className="w-full aspect-[4/3] rounded-2xl overflow-hidden shadow-2xl border border-border bg-card flex flex-col">
              {/* Top bar */}
              <div className="h-12 border-b border-border flex items-center justify-between px-4 bg-card shrink-0">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 bg-primary rounded flex items-center justify-center">
                    <div className="w-3.5 h-3.5 border-2 border-primary-foreground rounded-sm" />
                  </div>
                  <span className="font-headline text-primary text-sm font-bold">
                    MaintenEase
                    <span className="text-[10px] font-sans font-medium text-muted-foreground ml-1.5 italic">v4.2</span>
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="px-2 py-0.5 bg-success/10 text-success text-[10px] font-semibold rounded-full border border-success/20 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-success rounded-full animate-pulse" />
                    System Optimal
                  </div>
                  <div className="w-6 h-6 rounded-full bg-muted border border-border" />
                </div>
              </div>

              {/* Body: sidebar + grid */}
              <div className="flex-1 flex overflow-hidden min-h-0">
                {/* Sidebar */}
                <div className="w-12 border-r border-border bg-muted/40 flex flex-col items-center py-4 gap-4 shrink-0">
                  <div className="w-8 h-8 bg-primary/10 text-primary rounded-md flex items-center justify-center">
                    <Menu className="w-4 h-4" />
                  </div>
                  <LayoutGrid className="w-4 h-4 text-muted-foreground" />
                  <BarChart3 className="w-4 h-4 text-muted-foreground" />
                </div>

                {/* Grid */}
                <div className="flex-1 p-3 grid grid-cols-12 grid-rows-6 gap-2 bg-muted/20 min-h-0">
                  {/* KPI row */}
                  {[
                    { l: "Active WOs", v: "142", d: "+12%", c: "text-success" },
                    { l: "MTBF Avg", v: "842h", d: "-2%", c: "text-warning" },
                    { l: "Compliance", v: "98.4%", d: "Stable", c: "text-success" },
                  ].map((k) => (
                    <div
                      key={k.l}
                      className="col-span-4 row-span-1 bg-card p-2 rounded-md border border-border flex flex-col justify-center"
                    >
                      <span className="text-[8px] font-bold text-muted-foreground uppercase tracking-wider">
                        {k.l}
                      </span>
                      <div className="flex items-end gap-1.5">
                        <span className="text-lg font-bold text-primary leading-none">{k.v}</span>
                        <span className={`text-[9px] font-medium mb-0.5 ${k.c}`}>{k.d}</span>
                      </div>
                    </div>
                  ))}

                  {/* Chart */}
                  <div className="col-span-8 row-span-3 bg-card p-3 rounded-md border border-border flex flex-col">
                    <div className="flex justify-between items-center mb-2">
                      <h3 className="text-[10px] font-bold text-primary">Downtime Prevention</h3>
                      <div className="flex gap-2">
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary" />
                          <span className="text-[8px] text-muted-foreground">Predicted</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-primary/30" />
                          <span className="text-[8px] text-muted-foreground">Actual</span>
                        </div>
                      </div>
                    </div>
                    <div className="flex-1 flex items-end justify-between gap-1.5 px-1 pb-1 min-h-0">
                      {[
                        [55, 70],
                        [70, 85],
                        [45, 60],
                        [90, 100],
                        [75, 90],
                        [35, 45],
                      ].map(([a, b], i) => (
                        <div key={i} className="flex-1 flex items-end justify-center gap-0.5 h-full">
                          <div
                            className="w-full bg-primary/25 rounded-t-sm"
                            style={{ height: `${a}%` }}
                          />
                          <div
                            className="w-full bg-primary rounded-t-sm"
                            style={{ height: `${b}%` }}
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Priority breakdown */}
                  <div className="col-span-4 row-span-3 bg-card p-3 rounded-md border border-border flex flex-col">
                    <h3 className="text-[10px] font-bold text-primary mb-2">Priority</h3>
                    <div className="space-y-2 flex-1 flex flex-col justify-center">
                      {[
                        { l: "Critical", v: 12, c: "bg-destructive", t: "text-destructive" },
                        { l: "Preventive", v: 68, c: "bg-primary", t: "text-primary" },
                        { l: "Inspection", v: 20, c: "bg-primary/40", t: "text-primary/70" },
                      ].map((p) => (
                        <div key={p.l}>
                          <div className="flex justify-between text-[9px] mb-1">
                            <span className="text-muted-foreground">{p.l}</span>
                            <span className={`font-bold ${p.t}`}>{p.v}%</span>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div className={`${p.c} h-full`} style={{ width: `${p.v}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* High priority assets */}
                  <div className="col-span-12 row-span-2 bg-card rounded-md border border-border overflow-hidden flex flex-col">
                    <div className="bg-muted/40 px-3 py-1.5 border-b border-border flex justify-between items-center">
                      <h3 className="text-[9px] font-bold text-primary uppercase tracking-wide">
                        High-Priority Assets
                      </h3>
                      <span className="text-[8px] text-primary font-semibold">View All</span>
                    </div>
                    <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-px bg-border min-h-0">
                      <div className="bg-card p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded bg-destructive/10 flex items-center justify-center text-destructive font-bold text-[9px] shrink-0">
                            P1
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-foreground truncate">HVAC Unit #402</p>
                            <p className="text-[8px] text-muted-foreground truncate">Bearing failure 48h</p>
                          </div>
                        </div>
                        <div className="px-1.5 py-0.5 bg-warning/10 text-warning text-[8px] rounded border border-warning/20 shrink-0">
                          Scheduled
                        </div>
                      </div>
                      <div className="bg-card p-2 flex items-center justify-between">
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="w-7 h-7 rounded bg-primary/10 flex items-center justify-center text-primary font-bold text-[9px] shrink-0">
                            P2
                          </div>
                          <div className="min-w-0">
                            <p className="text-[10px] font-bold text-foreground truncate">Conveyor B-12</p>
                            <p className="text-[8px] text-muted-foreground truncate">Routine inspection</p>
                          </div>
                        </div>
                        <div className="px-1.5 py-0.5 bg-success/10 text-success text-[8px] rounded border border-success/20 shrink-0">
                          In Progress
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
