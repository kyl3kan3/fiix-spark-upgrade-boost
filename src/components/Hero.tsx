import { ArrowRight, CheckCircle2, Zap, TrendingUp } from "lucide-react";
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
                Fewer missed requests
              </li>
              <li className="flex items-start gap-2 justify-center md:justify-start">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                Less back and forth
              </li>
              <li className="flex items-start gap-2 justify-center md:justify-start">
                <CheckCircle2 className="h-4 w-4 text-success mt-0.5 shrink-0" />
                Clear visibility from request to completion
              </li>
            </ul>

            <div className="flex flex-col sm:flex-row items-center gap-4 justify-center md:justify-start pt-2">
              <Button
                size="lg"
                className="w-full sm:w-auto bg-primary text-primary-foreground hover:bg-primary-variant px-8 shadow-md uppercase tracking-wide transition-all hover:-translate-y-0.5 active:scale-95 group"
                onClick={() => navigate("/contact")}
              >
                Talk to us
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </div>
          </div>

          {/* Hero visual — simulated dashboard preview */}
          <div className="flex-1 w-full max-w-lg relative">
            <div className="w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg relative border border-border bg-card">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
              <div className="relative p-6 h-full flex flex-col justify-between">
                {/* Top status badge */}
                <div className="flex justify-end">
                  <div className="flex items-center gap-2 bg-background border border-border rounded-lg px-3 py-2 shadow-sm text-xs">
                    <div className="h-7 w-7 rounded-full bg-success/10 flex items-center justify-center">
                      <CheckCircle2 className="h-4 w-4 text-success" />
                    </div>
                    <div>
                      <div className="font-semibold text-foreground text-[11px]">System Status</div>
                      <div className="text-success font-medium text-[10px]">Optimal (99.9%)</div>
                    </div>
                  </div>
                </div>

                {/* Simulated chart bars */}
                <div className="flex gap-2 w-full h-20 items-end opacity-80 px-2">
                  {[40, 60, 80, 50, 100, 70, 55].map((h, i) => (
                    <div
                      key={i}
                      className="flex-1 rounded-t-sm"
                      style={{
                        height: `${h}%`,
                        background: i === 4 ? "hsl(var(--primary))" : "hsl(var(--muted))",
                      }}
                    />
                  ))}
                </div>

                {/* Bottom work orders summary */}
                <div className="bg-background/90 backdrop-blur-sm p-4 rounded-lg border border-border shadow-sm">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-foreground">
                      Weekly Work Orders
                    </span>
                    <TrendingUp className="h-4 w-4 text-primary" />
                  </div>
                  <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden flex">
                    <div className="h-full bg-primary w-[70%]" />
                    <div className="h-full bg-warning w-[20%]" />
                    <div className="h-full bg-destructive w-[10%]" />
                  </div>
                  <div className="flex justify-between mt-1.5 text-[10px] text-muted-foreground">
                    <span>Completed (70%)</span>
                    <span>Pending (20%)</span>
                    <span>Overdue (10%)</span>
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
