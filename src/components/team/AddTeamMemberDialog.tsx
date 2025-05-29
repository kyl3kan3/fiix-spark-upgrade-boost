
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
    console.log("=== DIALOG SUBMISSION START ===");
    console.log("AddTeamMemberDialog handleSubmit called with:", data);
    console.log("Current user in dialog:", user);
    console.log("Dialog state:", { isSubmitting, error });
    
    try {
      const success = await sendInvitation(data.email);
      console.log("Dialog submission result:", success);
      return success;
    } catch (error) {
      console.error("Error in dialog handleSubmit:", error);
      return false;
    }
  };

  const isDisabled = !user;

  console.log("AddTeamMemberDialog render state:", { 
    user: !!user, 
    isSubmitting, 
    error, 
    isDisabled 
  });

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
