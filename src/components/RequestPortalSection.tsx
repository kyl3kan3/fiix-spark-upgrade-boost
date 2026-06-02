import { AlertTriangle, QrCode, Wrench, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const RequestPortalSection = () => {
  return (
    <section className="py-20 bg-background border-y border-border">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary/10 text-secondary text-xs font-semibold mb-4 uppercase tracking-wide">
              <Zap className="h-3 w-3" /> NEW
            </div>
            <h2 className="font-headline text-3xl md:text-4xl font-bold mb-4 text-foreground">
              Give your customers a way to report problems — instantly
            </h2>
            <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
              Every MaintenEase account comes with a free, branded public request portal. Share the link
              on your website, post a QR code on the wall, or email it to tenants. Submissions land
              straight in your inbox with full context.
            </p>
            <div className="space-y-4 mb-8">
              <div className="flex gap-3">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                  <AlertTriangle className="h-5 w-5 text-destructive" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">Urgent lane for "I need this fixed now"</p>
                  <p className="text-sm text-muted-foreground">Urgent requests fire instant push and email alerts to your on-call team. No more missed emergencies.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Wrench className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">One click to a work order</p>
                  <p className="text-sm text-muted-foreground">Convert any incoming request into a fully populated work order with location, photos, and contact info.</p>
                </div>
              </div>
              <div className="flex gap-3">
                <div className="shrink-0 h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <QrCode className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-semibold text-foreground">No login required</p>
                  <p className="text-sm text-muted-foreground">Tenants, staff, or the public can submit a request in 30 seconds — no app install, no account.</p>
                </div>
              </div>
            </div>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary-variant uppercase tracking-wide font-semibold shadow-md hover:-translate-y-0.5 transition-all">
              <Link to="/solutions/maintenance-request-portal">See how it works</Link>
            </Button>
          </div>

          <div className="bg-card rounded-xl border border-border shadow-lg p-6 md:p-8">
            <div className="flex items-center gap-2 pb-4 border-b border-border mb-5">
              <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground">
                <Wrench className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-muted-foreground">Maintenance requests</p>
                <p className="font-semibold text-foreground text-sm">Acme Facilities</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-4 rounded-lg border-2 border-border bg-card hover:border-primary/30 transition-colors">
                <Wrench className="h-5 w-5 text-primary mb-1" />
                <p className="font-semibold text-sm text-foreground">Submit a request</p>
              </div>
              <div className="p-4 rounded-lg border-2 border-destructive/40 bg-destructive/5">
                <AlertTriangle className="h-5 w-5 text-destructive mb-1" />
                <p className="font-semibold text-sm text-destructive">Urgent — needs fixing now</p>
              </div>
            </div>
            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs text-muted-foreground mb-1">What's the issue?</p>
                <div className="h-9 rounded-lg border border-border bg-muted px-3 flex items-center text-foreground">
                  Leaking sink in break room
                </div>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Location</p>
                <div className="h-9 rounded-lg border border-border bg-muted px-3 flex items-center text-foreground">
                  Building B, 2nd floor
                </div>
              </div>
              <div className="h-10 rounded-lg bg-destructive text-white font-semibold flex items-center justify-center text-sm">
                Send urgent alert
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default RequestPortalSection;