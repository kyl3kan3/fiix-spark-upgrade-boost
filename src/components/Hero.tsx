import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import Tilt3D from "@/components/marketing/Tilt3D";
import { SIGNUP_PATH } from "@/data/signupRoute";
import { Menu, LayoutGrid, BarChart3 } from "lucide-react";

const Hero = () => {
  const navigate = useNavigate();
  return (
    <header className="relative overflow-hidden bg-background pb-20 pt-8 md:pb-28">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "linear-gradient(hsl(var(--primary) / 0.05) 1px, transparent 1px), linear-gradient(90deg, hsl(var(--primary) / 0.05) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 75%)",
          WebkitMaskImage: "radial-gradient(ellipse 90% 80% at 50% 40%, black 30%, transparent 75%)",
        }}
      />

      <div className="container relative z-10 mx-auto max-w-7xl px-4">
        <div className="flex flex-col items-center gap-12 md:flex-row">
          <div className="flex-1 space-y-8 text-center md:text-left">
            <h1 className="font-headline text-4xl font-bold leading-[1.1] tracking-normal text-foreground md:text-5xl xl:text-[3.25rem]">
              CMMS Software for Facility &amp; Maintenance Teams
            </h1>

            <div className="flex justify-center pt-2 md:justify-start">
              <Button
                size="lg"
                className="w-full bg-primary px-8 uppercase tracking-wide text-primary-foreground shadow-md transition-ui hover:bg-primary-variant sm:w-auto"
                onClick={() => navigate(SIGNUP_PATH)}
              >
                Start free trial
                <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
              </Button>
            </div>
          </div>

          <div className="relative w-full max-w-xl flex-1">
            <Tilt3D maxTilt={7} className="float-3d">
              <div className="flex aspect-[4/3] w-full flex-col overflow-hidden rounded-2xl border border-border bg-card shadow-2xl">
                <div className="flex h-12 shrink-0 items-center justify-between border-b border-border bg-card px-4">
                  <div className="flex items-center gap-2">
                    <div className="flex h-7 w-7 items-center justify-center rounded bg-primary">
                      <div className="h-3.5 w-3.5 rounded-sm border-2 border-primary-foreground" />
                    </div>
                    <span className="font-headline text-sm font-bold text-primary">MaintenEase</span>
                  </div>
                  <div className="h-6 w-6 rounded-full border border-border bg-muted" />
                </div>

                <div className="flex min-h-0 flex-1 overflow-hidden">
                  <div className="flex w-12 shrink-0 flex-col items-center gap-4 border-r border-border bg-muted/40 py-4">
                    <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary/10 text-primary">
                      <Menu className="h-4 w-4" />
                    </div>
                    <LayoutGrid className="h-4 w-4 text-muted-foreground" />
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </div>

                  <div className="grid min-h-0 flex-1 grid-cols-12 grid-rows-6 gap-2 bg-muted/20 p-3">
                    {[
                      { l: "Active WOs", v: "142" },
                      { l: "MTBF Avg", v: "842h" },
                      { l: "Compliance", v: "98.4%" },
                    ].map((k) => (
                      <div
                        key={k.l}
                        className="col-span-4 row-span-1 flex flex-col justify-center rounded-md border border-border bg-card p-2"
                      >
                        <span className="text-[8px] font-bold uppercase tracking-wider text-muted-foreground">
                          {k.l}
                        </span>
                        <span className="text-lg font-bold leading-none text-primary">{k.v}</span>
                      </div>
                    ))}
                    <div className="col-span-12 row-span-3 rounded-md border border-border bg-card p-3">
                      <h3 className="text-[10px] font-bold text-primary">Work queue</h3>
                    </div>
                  </div>
                </div>
              </div>
            </Tilt3D>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Hero;
