
import { Button } from "@/components/ui/button";
import { ArrowRight, Wrench, ClipboardCheck, CalendarClock, Package } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
 const navigate = useNavigate();
 return (
 <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-background via-fiix-50 to-background">
 <div className="container mx-auto px-4">
 <div className="flex flex-col md:flex-row items-center">
 <div className="md:w-1/2 mb-12 md:mb-0 animate-fade-in">
 <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
 Simplify Your <span className="text-fiix-600">Maintenance</span> Management
 </h1>
 <p className="text-xl text-foreground mb-8 max-w-lg">
 The complete CMMS solution that helps you organize, track, and optimize your maintenance operations.
 </p>
 <div className="flex flex-col sm:flex-row gap-4">
 <Button
 size="lg"
               className="bg-fiix-600 hover:bg-fiix-700 text-white px-8 shadow-lg shadow-fiix-600/30 hover:shadow-xl hover:shadow-fiix-600/40 hover:scale-[1.02] transition-all group"
 onClick={() => navigate("/auth?signup=true")}
 >
               Get started free
               <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
 </Button>
 <Button
 size="lg"
 variant="outline"
 className="group"
 onClick={() => navigate("/auth")}
 >
 Book a Demo
 <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
 </Button>
 </div>
 <div className="mt-8 text-sm text-foreground">
 Join 3,000+ companies already managing their assets
 </div>
 </div>
 <div className="md:w-1/2 animate-slide-up">
 <div className="relative">
 <div className="absolute inset-0 bg-gradient-to-r from-fiix-200 to-fiix-400 rounded-xl transform rotate-3 opacity-30"></div>
 <div className="relative bg-card p-4 rounded-lg shadow-xl">
              <div className="aspect-[16/9] bg-fiix-50 rounded-md p-5 flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-md bg-fiix-600 flex items-center justify-center">
                      <Wrench className="h-4 w-4 text-white" />
                    </div>
                    <span className="text-sm font-semibold text-foreground">Maintenance Dashboard</span>
                  </div>
                  <div className="flex gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-fiix-300"></span>
                    <span className="w-2 h-2 rounded-full bg-fiix-400"></span>
                    <span className="w-2 h-2 rounded-full bg-fiix-600"></span>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-3 mb-4">
                  {[
                    { label: "Open WOs", value: "24", Icon: ClipboardCheck },
                    { label: "Due today", value: "7", Icon: CalendarClock },
                    { label: "Assets", value: "318", Icon: Package },
                  ].map(({ label, value, Icon }) => (
                    <div key={label} className="bg-card border border-fiix-200 rounded-md p-3">
                      <Icon className="h-4 w-4 text-fiix-600 mb-2" />
                      <div className="text-lg font-bold text-foreground leading-none">{value}</div>
                      <div className="text-[10px] text-muted-foreground mt-1">{label}</div>
                    </div>
                  ))}
                </div>
                <div className="flex-1 bg-card border border-fiix-200 rounded-md p-3 space-y-2">
                  {[
                    { t: "Replace HVAC filter — Bldg A", s: "In progress" },
                    { t: "Inspect generator #3", s: "Scheduled" },
                    { t: "Lubricate conveyor belt", s: "Due soon" },
                  ].map((row) => (
                    <div key={row.t} className="flex items-center justify-between">
                      <div className="flex items-center gap-2 min-w-0">
                        <span className="w-1.5 h-1.5 rounded-full bg-fiix-600 shrink-0"></span>
                        <span className="text-xs text-foreground truncate">{row.t}</span>
                      </div>
                      <span className="text-[10px] text-fiix-600 font-medium shrink-0 ml-2">{row.s}</span>
                    </div>
                  ))}
                </div>
              </div>
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>
 );
};

export default Hero;
