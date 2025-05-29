
import React, { useState } from "react";
import {
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTeamInvitation } from "@/hooks/team/useTeamInvitation";
import { useAuth } from "@/hooks/auth";
import TeamMemberForm from "./form/TeamMemberForm";
import { TeamMemberFormValues } from "./types";

const AddTeamMemberDialog = () => {
  const { user } = useAuth();
  const { sendInvitation, isSubmitting, error } = useTeamInvitation();
  const [companyName] = useState(user?.user_metadata?.company_name || "Your Company");

  const handleSubmit = async (data: TeamMemberFormValues) => {
    console.log("AddTeamMemberDialog handleSubmit called with:", data);
    const success = await sendInvitation(data.email);
    console.log("Invitation result:", success);
    return success;
  };

  const isDisabled = !user;

  return (
    <DialogContent className="sm:max-w-[425px]">
      <DialogHeader>
        <DialogTitle>Add Team Member</DialogTitle>
        <DialogDescription>
          Send an invitation to a new team member. They'll receive an email with instructions to join your team.
        </DialogDescription>
      </DialogHeader>
      
      {error && (
        <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-md">
          {error}
        </div>
      )}
      
      <TeamMemberForm
        onSubmit={handleSubmit}
        isSubmitting={isSubmitting}
        isDisabled={isDisabled}
        companyName={companyName}
      />
    </DialogContent>
  );
};

export default AddTeamMemberDialog;
