import React, { ReactNode } from "react";
import { Building2 } from "lucide-react";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <main className="w-full h-screen flex flex-col md:flex-row">
      {/* Left side: Brand imagery & value proposition — hidden on mobile */}
      <div className="hidden md:flex flex-1 relative overflow-hidden bg-primary">
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/70 to-primary/40 z-10" />

        {/* Brand logo top-left */}
        <div className="relative z-20 p-8 flex flex-col justify-between h-full w-full">
          <Link
            to="/"
            aria-label="MaintenEase home"
            className="flex items-center gap-2 text-primary-foreground"
          >
            <Building2 className="h-7 w-7" strokeWidth={1.5} />
            <span className="font-headline text-xl font-bold tracking-normal">MaintenEase</span>
          </Link>

          <div className="mb-12 max-w-lg">
            <p className="font-headline text-4xl xl:text-5xl font-bold text-primary-foreground mb-6 leading-tight">
              Precision Facility Management.
            </p>
            <p className="text-base text-primary-foreground/85 leading-relaxed">
              Move from reactive fixes to proactive maintenance. Track assets, work orders,
              inspections, and team workflows in one workspace built for facility and
              industrial maintenance teams.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-primary-foreground/80">
              <li>Flat account pricing with published seat and capacity limits</li>
              <li>7-day free trial on every plan — card required, cancel before day 8</li>
              <li>Free onboarding and data import included</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side: Auth form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-background relative overflow-y-auto">
        {/* Mobile brand header */}
        <Link
          to="/"
          aria-label="MaintenEase home"
          className="md:hidden absolute top-6 left-6 flex items-center gap-2 text-primary"
        >
          <Building2 className="h-6 w-6" strokeWidth={1.5} />
          <span className="font-headline text-lg font-bold tracking-normal">MaintenEase</span>
        </Link>

        <div className="w-full max-w-md mt-14 md:mt-0 space-y-8">
          {children}
        </div>
      </div>
    </main>
  );
};
