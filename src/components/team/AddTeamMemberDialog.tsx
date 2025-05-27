
import React, { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import TeamMemberForm from "./form/TeamMemberForm";
import { TeamMemberFormValues } from "./types";
import { useAdminStatus } from "@/hooks/team/useAdminStatus";
import { useTeamInvitation } from "@/hooks/team/useTeamInvitation";

const AddTeamMemberDialog = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAdminUser, companyName, isLoading, error: statusError } = useAdminStatus();
  const { sendInvitation } = useTeamInvitation();

  const onSubmit = async (data: TeamMemberFormValues) => {
    console.log("Form submitted with data:", data);
    console.log("Admin status:", { isAdminUser, isLoading });
    
    if (!isAdminUser && !isLoading) {
      toast.error("Only administrators can add team members");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Use the team invitation hook to send the invitation
      const success = await sendInvitation(data.email);
      
      if (success) {
        toast.success(`Invitation sent to ${data.email}`);
      } else {
        toast.error("Failed to send invitation");
      }
    } catch (err: any) {
      console.error("Error sending invitation:", err);
      setError(err.message || "Failed to send invitation");
      toast.error("Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Don't show admin warning while loading
  const showAdminWarning = !isLoading && !isAdminUser;
  // Only disable form if we're sure the user is not an admin (not while loading)
  const isFormDisabled = !isLoading && !isAdminUser;

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add New Team Member</DialogTitle>
        <DialogDescription>
          Enter the details of the new team member to invite them to the platform.
        </DialogDescription>
      </DialogHeader>
      
      {showAdminWarning && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Only administrators can add new team members
          </AlertDescription>
        </Alert>
      )}
      
      {(error || statusError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || statusError}</AlertDescription>
        </Alert>
      )}
      
      <TeamMemberForm 
        onSubmit={onSubmit}
        isSubmitting={isSubmitting}
        isDisabled={isFormDisabled}
        companyName={companyName}
      />
    </DialogContent>
  );
};

export default AddTeamMemberDialog;
