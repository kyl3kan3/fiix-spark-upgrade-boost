import React from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Boxes, ClipboardList, Compass, UserPlus } from "lucide-react";

/**
 * Shown on the dashboard when the workspace has no work orders yet. A brand
 * new account otherwise lands on a page of zeros; this gives it a concrete
 * path to a working setup instead.
 */

const steps = [
  {
    icon: Boxes,
    title: "Add your assets",
    detail: "Equipment, vehicles, or buildings — whatever you maintain.",
    href: "/assets",
  },
  {
    icon: ClipboardList,
    title: "Create a work order",
    detail: "Log the next job so nothing lives in texts or memory.",
    href: "/work-orders/new",
  },
  {
    icon: UserPlus,
    title: "Invite your team",
    detail: "Flat pricing — bring the whole crew at no extra cost.",
    href: "/team",
  },
  {
    icon: Compass,
    title: "Or take the guided setup",
    detail: "A short walkthrough that sets everything up in order.",
    href: "/guided-setup",
  },
];

export function GetStartedPanel() {
  return (
    <section className="mt-8">
      <div className="surface-card p-6">
        <h3 className="font-headline text-xl text-foreground mb-1">
          Set up your workspace
        </h3>
        <p className="text-sm text-muted-foreground mb-5">
          Your dashboard fills in as you go — a few minutes of setup gets your
          first real numbers on this page.
        </p>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {steps.map((step) => (
            <Link
              key={step.href}
              to={step.href}
              className="group flex items-start gap-3 rounded-lg border border-border p-4 transition-colors hover:border-primary/30 hover:bg-primary/5"
            >
              <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <step.icon className="h-4 w-4" />
              </span>
              <span className="min-w-0 flex-1">
                <span className="flex items-center gap-1 font-medium text-foreground">
                  {step.title}
                  <ArrowRight className="h-3.5 w-3.5 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </span>
                <span className="mt-0.5 block text-xs text-muted-foreground">
                  {step.detail}
                </span>
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
