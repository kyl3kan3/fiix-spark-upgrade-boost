
import React, { ReactNode } from "react";
import { Wrench, ShieldCheck, Activity, Sparkles } from "lucide-react";

interface AuthLayoutProps {
  children: ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen w-full grid lg:grid-cols-2 bg-background">
      {/* Branded panel */}
      <div className="relative hidden lg:flex flex-col justify-between p-12 overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-glow text-primary-foreground">
        <div
          className="absolute inset-0 opacity-30 pointer-events-none"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, hsl(var(--primary-glow) / 0.6), transparent 45%), radial-gradient(circle at 80% 80%, hsl(var(--primary-foreground) / 0.15), transparent 50%)",
          }}
        />
        <div className="relative flex items-center gap-2.5">
          <div className="h-9 w-9 rounded-xl bg-primary-foreground/15 backdrop-blur-sm border border-primary-foreground/20 flex items-center justify-center">
            <Wrench className="h-4.5 w-4.5" />
          </div>
          <span className="text-lg font-semibold tracking-tight">MaintenEase</span>
        </div>

        <div className="relative space-y-6 max-w-md">
          <h1 className="text-4xl xl:text-5xl font-semibold tracking-tight leading-[1.05]">
            Operations, beautifully maintained.
          </h1>
          <p className="text-base text-primary-foreground/80 leading-relaxed">
            Track assets, dispatch work orders, and keep your team in sync — all from one calm, focused workspace.
          </p>
          <ul className="space-y-3 pt-2">
            {[
              { icon: Activity, text: "Real-time work order visibility" },
              { icon: ShieldCheck, text: "Role-based access, multi-tenant secure" },
              { icon: Sparkles, text: "Smart checklists and inspections" },
            ].map(({ icon: Icon, text }) => (
              <li key={text} className="flex items-center gap-3 text-sm text-primary-foreground/90">
                <span className="h-7 w-7 rounded-md bg-primary-foreground/15 border border-primary-foreground/20 flex items-center justify-center shrink-0">
                  <Icon className="h-3.5 w-3.5" />
                </span>
                {text}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-primary-foreground/60">
          © {new Date().getFullYear()} MaintenEase. Built for maintenance teams.
        </p>
      </div>

      {/* Form panel */}
      <div className="flex items-center justify-center p-6 sm:p-10 lg:p-12">
        <div className="w-full max-w-md">
          {/* Mobile brand */}
          <div className="flex items-center gap-2.5 mb-8 lg:hidden">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-primary to-primary-glow flex items-center justify-center shadow-glow">
              <Wrench className="h-4.5 w-4.5 text-primary-foreground" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">MaintenEase</span>
          </div>
          <div className="rounded-2xl border border-border/60 bg-card shadow-elegant p-7 sm:p-9 space-y-7">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
};
