import { AlertTriangle, QrCode, Wrench } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const RequestPortalSection = () => (
  <section className="py-20 bg-background border-y border-border">
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          <h2 className="font-headline text-3xl md:text-4xl font-bold mb-8 text-foreground">
            Public maintenance request portal
          </h2>
          <ul className="space-y-4 mb-8">
            <li className="flex gap-3 items-center font-semibold text-foreground">
              <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
              Urgent requests
            </li>
            <li className="flex gap-3 items-center font-semibold text-foreground">
              <Wrench className="h-5 w-5 text-primary shrink-0" />
              Convert to work orders
            </li>
            <li className="flex gap-3 items-center font-semibold text-foreground">
              <QrCode className="h-5 w-5 text-primary shrink-0" />
              No login required
            </li>
          </ul>
          <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary-variant uppercase tracking-wide font-semibold">
            <Link to="/solutions/maintenance-request-portal">Request portal</Link>
          </Button>
        </div>

        <div className="rounded-xl border border-border bg-card shadow-lg p-6 md:p-8" aria-hidden>
          <div className="h-10 rounded-lg bg-primary/10 mb-4" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-20 rounded-lg border border-border bg-muted/40" />
            <div className="h-20 rounded-lg border border-destructive/40 bg-destructive/5" />
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default RequestPortalSection;
