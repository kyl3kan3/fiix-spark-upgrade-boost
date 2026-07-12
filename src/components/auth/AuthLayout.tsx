import React, { ReactNode } from "react";
import { Building2 } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <main className="w-full h-screen flex flex-col md:flex-row">
      {/* Left side: Brand imagery & quote — hidden on mobile */}
      <div className="hidden md:flex flex-1 relative overflow-hidden bg-primary">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/40 z-10" />

        {/* Brand logo top-left */}
        <div className="relative z-20 p-8 flex flex-col justify-between h-full w-full">
          <div className="flex items-center gap-2 text-primary-foreground">
            <Building2 className="h-7 w-7" strokeWidth={1.5} />
            <span className="font-headline text-xl font-bold tracking-normal">MaintenEase</span>
          </div>

          {/* Quote / value proposition */}
          <div className="mb-12 max-w-lg">
            <h1 className="font-headline text-4xl xl:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
              Precision Facility Management.
            </h1>
            <p className="text-base text-primary-foreground/85 leading-relaxed">
              "MaintenEase transformed our operations. We moved from reactive fixes to
              proactive maintenance, saving thousands in downtime and extending asset life
              significantly."
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-foreground/20 flex items-center justify-center text-primary-foreground font-semibold text-sm">
                SJ
              </div>
              <div>
                <p className="text-sm font-semibold text-primary-foreground">Sarah Jenkins</p>
                <p className="text-xs text-primary-foreground/70">Director of Operations, Nexus Industrial</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Right side: Auth form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-background relative overflow-y-auto">
        {/* Mobile brand header */}
        <div className="md:hidden absolute top-6 left-6 flex items-center gap-2 text-primary">
          <Building2 className="h-6 w-6" strokeWidth={1.5} />
          <span className="font-headline text-lg font-bold tracking-normal">MaintenEase</span>
        </div>

        <div className="w-full max-w-md mt-14 md:mt-0 space-y-8">
          {children}
        </div>
      </div>
    </main>
  );
};
