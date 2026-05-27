import { Button } from "@/components/ui/button";
import { ArrowRight, SignalOff, Smartphone, TriangleAlert, Wrench, CheckCircle2 } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Hero = () => {
 const navigate = useNavigate();
 return (
 <section className="pt-32 pb-20 md:pt-40 md:pb-28 bg-gradient-to-br from-background via-fiix-50 to-background">
 <div className="container mx-auto px-4">
 <div className="flex flex-col md:flex-row items-center gap-10">
 <div className="md:w-1/2 mb-12 md:mb-0 animate-fade-in">
 <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight mb-6 text-foreground">
 Built for <span className="text-fiix-600">Technicians on the Floor</span>
 </h1>
 <p className="text-xl text-foreground mb-8 max-w-xl">
 A mobile-first CMMS for teams that manage work orders in the field, stay productive offline, and automate parts inventory from every completed job.
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
 </div>
 <div className="mt-8 grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
 <div className="rounded-lg border border-fiix-200 bg-card p-3">
 <div className="flex items-center gap-2 font-semibold text-foreground"><Smartphone className="h-4 w-4 text-fiix-600" /> Mobile-first</div>
 <p className="text-muted-foreground mt-1">Designed for floor teams, not desk workflows.</p>
 </div>
 <div className="rounded-lg border border-fiix-200 bg-card p-3">
 <div className="flex items-center gap-2 font-semibold text-foreground"><SignalOff className="h-4 w-4 text-fiix-600" /> Offline capable</div>
 <p className="text-muted-foreground mt-1">Work offline and auto-sync when connection returns.</p>
 </div>
 <div className="rounded-lg border border-fiix-200 bg-card p-3">
 <div className="flex items-center gap-2 font-semibold text-foreground"><TriangleAlert className="h-4 w-4 text-fiix-600" /> Inventory automation</div>
 <p className="text-muted-foreground mt-1">Auto-deduct parts and alert managers on low stock.</p>
 </div>
 </div>
 </div>
 <div className="md:w-1/2 animate-slide-up">
 <div className="relative max-w-sm mx-auto">
 <div className="absolute inset-0 bg-gradient-to-r from-fiix-200 to-fiix-400 rounded-[2rem] transform rotate-2 opacity-30"></div>
 <div className="relative bg-card border border-fiix-200 rounded-[2rem] shadow-xl p-4">
 <div className="rounded-[1.5rem] border border-fiix-200 bg-fiix-50 p-4">
 <div className="flex items-center justify-between mb-4">
 <span className="text-sm font-semibold text-foreground">Technician App</span>
 <span className="text-[11px] rounded-full bg-green-100 text-green-700 px-2 py-0.5">Sync queued</span>
 </div>
 <div className="space-y-3 mb-4">
 <div className="bg-card rounded-md border border-fiix-200 p-3">
 <div className="flex items-center justify-between">
 <div className="flex items-center gap-2">
 <Wrench className="h-4 w-4 text-fiix-600" />
 <span className="text-xs font-medium text-foreground">WO-1824 Replace pump seal</span>
 </div>
 <span className="text-[10px] text-fiix-600">Offline</span>
 </div>
 <p className="text-[11px] text-muted-foreground mt-1">Basement B2 • Updated 2m ago</p>
 </div>
 <div className="bg-card rounded-md border border-fiix-200 p-3">
 <p className="text-xs font-medium text-foreground">Parts Used</p>
 <div className="mt-2 space-y-1 text-[11px] text-muted-foreground">
 <div className="flex items-center justify-between"><span>SKF Bearing 6205</span><span>-1</span></div>
 <div className="flex items-center justify-between"><span>Hydraulic Seal Kit</span><span>-1</span></div>
 </div>
 </div>
 </div>
 <div className="bg-amber-50 border border-amber-200 rounded-md p-3">
 <div className="flex items-start gap-2">
 <TriangleAlert className="h-4 w-4 text-amber-600 mt-0.5" />
 <div>
 <p className="text-xs font-semibold text-amber-800">Low stock alert sent to manager</p>
 <p className="text-[11px] text-amber-700">Hydraulic Seal Kit: 2 left (reorder point: 3)</p>
 </div>
 </div>
 </div>
 <div className="mt-3 flex items-center gap-2 text-[11px] text-foreground">
 <CheckCircle2 className="h-4 w-4 text-green-600" />
 Work order completed. Data will sync automatically when reconnected.
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
