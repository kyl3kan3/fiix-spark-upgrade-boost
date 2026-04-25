import React, { ReactNode } from "react";
import { Wrench } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-[1.1fr,1fr] bg-background">
      {/* Industrial blueprint panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-foreground text-background">
        {/* Blueprint grid backdrop */}
        <div aria-hidden className="absolute inset-0 bg-blueprint-grid opacity-[0.08]" />
        <div aria-hidden className="absolute inset-0 bg-blueprint-grid-fine opacity-[0.04]" />

        {/* Corner registration marks */}
        <div aria-hidden className="absolute top-6 right-6 text-background/30 font-mono text-[10px] tracking-[0.3em] uppercase">
          ME · OPS / V.04
        </div>
        <div aria-hidden className="absolute bottom-6 right-6 text-background/30 font-mono text-[10px] tracking-[0.3em] uppercase">
          AUTH · 001
        </div>

        {/* Brand */}
        <div className="relative flex items-center gap-3">
          <div className="h-9 w-9 border border-background/30 flex items-center justify-center">
            <Wrench className="h-4 w-4 text-accent" strokeWidth={1.5} />
          </div>
          <div className="leading-none">
            <div className="font-display font-bold text-lg tracking-tight">MaintenEase</div>
            <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-background/50 mt-1">
              Maintenance Operations
            </div>
          </div>
        </div>

        {/* Schematic-style hero */}
        <div className="relative space-y-8 max-w-lg">
          <div className="label-eyebrow text-background/50">SECTION 01 — OVERVIEW</div>
          <h1 className="font-display text-5xl xl:text-6xl font-bold tracking-tight leading-[0.95]">
            Built for the
            <br />
            <span className="text-accent">field</span>, not the
            <br />
            boardroom.
          </h1>
          <div className="divider-ticked" />
          <p className="text-base text-background/70 leading-relaxed font-sans">
            Track equipment, dispatch work orders, and keep your crew aligned —
            with the precision of an engineer's notebook.
          </p>

          {/* Spec-sheet style feature list */}
          <div className="space-y-2 pt-2">
            {[
              ["WO·SYS", "Real-time work order dispatch"],
              ["RBAC",   "Role-based access · multi-tenant"],
              ["INSP",   "Templated checklists & inspections"],
              ["AST",    "Asset hierarchy with QR identifiers"],
            ].map(([code, label]) => (
              <div key={code} className="flex items-center gap-4 py-1.5 border-t border-background/10">
                <span className="font-mono text-[11px] tracking-[0.18em] text-accent w-16 shrink-0">{code}</span>
                <span className="text-sm text-background/85">{label}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-end justify-between text-[10px] font-mono uppercase tracking-[0.3em] text-background/40">
          <span>© {new Date().getFullYear()} MAINTENEASE</span>
          <span>SHEET 01 / 01</span>
        </div>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-14 relative">
        <div aria-hidden className="absolute inset-0 bg-blueprint-grid opacity-[0.4] pointer-events-none" />

        <div className="relative w-full max-w-[420px]">
          {/* Mobile brand */}
          <div className="flex items-center gap-3 mb-8 lg:hidden">
            <div className="h-9 w-9 border border-foreground flex items-center justify-center">
              <Wrench className="h-4 w-4 text-accent" strokeWidth={1.5} />
            </div>
            <span className="font-display text-lg font-bold tracking-tight">MaintenEase</span>
          </div>

          {/* Ticket-style form card */}
          <div className="ticket-card-accent p-7 sm:p-9 space-y-7">
            <div className="label-eyebrow flex items-center justify-between">
              <span>FORM · ACCESS-001</span>
              <span className="text-accent">●</span>
            </div>
            {children}
          </div>

          <div className="mt-4 flex items-center justify-between text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground">
            <span>REV. 04 · 2026</span>
            <span>SECURE / TLS</span>
          </div>
        </div>
      </div>
    </div>
  );
};
