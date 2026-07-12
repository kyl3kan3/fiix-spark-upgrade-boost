
import React from "react";
import { useTeamSetupAuth } from "@/hooks/team/useTeamSetupAuth";
import { useTeamInvitation } from "@/hooks/team/useTeamInvitation";
import { TeamSetupHeader } from "@/components/team/setup/TeamSetupHeader";
import { TeamSetupForm } from "@/components/team/setup/TeamSetupForm";
import { TeamSetupActions } from "@/components/team/setup/TeamSetupActions";
import { TeamSetupNotAuthorized } from "@/components/team/setup/TeamSetupNotAuthorized";
import { TeamSetupLoading } from "@/components/team/setup/TeamSetupLoading";
import { Building2 } from "lucide-react";

const TeamSetup: React.FC = () => {
  const { isLoading, isAdmin, companyName } = useTeamSetupAuth();
  const { sendInvitation, isSubmitting, error } = useTeamInvitation();

  if (isLoading) {
    return <TeamSetupLoading />;
  }

  if (!isAdmin) {
    return <TeamSetupNotAuthorized />;
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Top nav bar */}
      <nav className="fixed top-0 z-50 w-full h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
        <div className="flex items-center gap-2">
          <Building2 className="h-5 w-5 text-primary" strokeWidth={1.5} />
          <span className="font-headline text-lg font-bold text-primary">MaintenEase</span>
          <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
            Setup Wizard
          </span>
        </div>
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <span>Step 2 of 4</span>
          <div className="w-28 h-1.5 bg-muted rounded-full overflow-hidden">
            <div className="w-1/2 h-full bg-primary rounded-full" />
          </div>
        </div>
      </nav>

      <main className="pt-24 pb-20 px-4 max-w-5xl mx-auto">
        {/* Page header */}
        <div className="text-center mb-10">
          <h1 className="font-headline text-2xl md:text-3xl font-bold text-primary mb-2">
            Invite Your Team
          </h1>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            Collaboration is the core of efficient facility management. Add your administrators,
            managers, and technicians to get started.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Form card */}
          <div className="lg:col-span-7">
            <div className="bg-card rounded-xl shadow-sm border border-border overflow-hidden">
              <TeamSetupHeader companyName={companyName} />
              <div className="p-6 md:p-8">
                <TeamSetupForm
                  onSubmit={sendInvitation}
                  isSubmitting={isSubmitting}
                  error={error}
                />
                <TeamSetupActions isSubmitting={isSubmitting} />
              </div>
            </div>
          </div>

          {/* Role info sidebar */}
          <aside className="lg:col-span-5 space-y-4">
            {[
              { role: "Admin", desc: "Full system access, billing, and user management." },
              { role: "Manager", desc: "Approves work orders and manages inventory." },
              { role: "Technician", desc: "Executes work orders and logs maintenance data." },
            ].map(({ role, desc }) => (
              <div key={role} className="bg-muted/50 rounded-xl p-4 border border-border">
                <p className="text-sm font-semibold text-primary mb-1">{role}</p>
                <p className="text-xs text-muted-foreground">{desc}</p>
              </div>
            ))}
          </aside>
        </div>
      </main>
    </div>
  );
};

export default TeamSetup;
