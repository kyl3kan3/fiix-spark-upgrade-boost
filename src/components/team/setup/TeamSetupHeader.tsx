
import React from "react";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Users } from "lucide-react";

interface TeamSetupHeaderProps {
  companyName?: string;
}

export const TeamSetupHeader: React.FC<TeamSetupHeaderProps> = ({ companyName }) => {
  return (
    <CardHeader className="text-center">
      <div className="mx-auto rounded-full bg-blue-100 p-3 mb-4">
        <Users className="h-8 w-8 text-blue-600" />
      </div>
      <CardTitle className="text-2xl">Invite Your Team</CardTitle>
      <CardDescription>
        {companyName ? `Add team members to ${companyName}` : "Invite colleagues to join your organization"}
      </CardDescription>
    </CardHeader>
  );
};
