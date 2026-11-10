import React, { ReactNode } from "react";
import BrandMark from "@/components/shell/BrandMark";
import { Link } from "react-router-dom";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <main className="w-full h-screen flex flex-col md:flex-row">
      {/* Left side: Brand imagery & value proposition — hidden on mobile */}
      <div className="hidden md:flex flex-1 relative overflow-hidden bg-sidebar">

        {/* Brand logo top-left */}
        <div className="relative z-20 p-8 flex flex-col justify-between h-full w-full">
          <Link
            to="/"
            aria-label="MaintenEase home"
            className="inline-flex self-start rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-sidebar-ring"
          >
            <BrandMark tone="onInk" />
          </Link>

          <div className="mb-12 max-w-lg">
            <p className="font-headline text-5xl xl:text-6xl font-bold text-white mb-6 leading-[1.02]">
              Precision Facility Management.
            </p>
            <p className="text-base text-sidebar-foreground leading-relaxed">
              Move from reactive fixes to proactive maintenance. Track assets, work orders,
              inspections, and team workflows in one workspace built for facility and
              industrial maintenance teams.
            </p>
            <ul className="mt-8 space-y-3 border-l-[3px] border-highlight pl-4 text-sm text-white">
              <li>Flat account pricing with published seat and capacity limits</li>
              <li>7-day free trial on every plan — cancel before day 8 if you do not want to continue</li>
              <li>Free onboarding and data import included</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Right side: Auth form */}
      <div className="flex-1 flex flex-col justify-center items-center p-6 md:p-12 bg-card relative overflow-y-auto">
        {/* Mobile brand header */}
        <Link
          to="/"
          aria-label="MaintenEase home"
          className="md:hidden absolute top-6 left-6"
        >
          <BrandMark />
        </Link>

        <div className="w-full max-w-md mt-14 md:mt-0 space-y-8">
          {children}
        </div>
      </div>
    </main>
  );
};
