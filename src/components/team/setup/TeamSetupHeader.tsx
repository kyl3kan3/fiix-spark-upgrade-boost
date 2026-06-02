
import React from "react";
import { UserPlus } from "lucide-react";

interface TeamSetupHeaderProps {
  companyName?: string;
}

export const TeamSetupHeader: React.FC<TeamSetupHeaderProps> = ({ companyName }) => {
  return (
    <div className="flex items-center gap-4 p-6 border-b border-border bg-muted/30">
      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <UserPlus className="h-5 w-5 text-primary" />
      </div>
      <div>
        <h2 className="font-headline text-lg font-bold text-foreground">Add Members</h2>
        <p className="text-xs text-muted-foreground">
          {companyName ? `Add team members to ${companyName}` : "Invite colleagues to join your organization"}
        </p>
      </div>
    </div>
  );
};
