
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { useTeamSetupAuth } from "@/hooks/team/useTeamSetupAuth";
import { useTeamInvitation } from "@/hooks/team/useTeamInvitation";
import { TeamSetupHeader } from "@/components/team/setup/TeamSetupHeader";
import { TeamSetupForm } from "@/components/team/setup/TeamSetupForm";
import { TeamSetupActions } from "@/components/team/setup/TeamSetupActions";
import { TeamSetupNotAuthorized } from "@/components/team/setup/TeamSetupNotAuthorized";
import { TeamSetupLoading } from "@/components/team/setup/TeamSetupLoading";

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
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <TeamSetupHeader companyName={companyName} />
        <CardContent>
          <TeamSetupForm
            onSubmit={sendInvitation}
            isSubmitting={isSubmitting}
            error={error}
          />
          <TeamSetupActions isSubmitting={isSubmitting} />
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamSetup;
