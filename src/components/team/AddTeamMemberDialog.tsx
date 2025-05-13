
import React, { useState } from "react";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import TeamMemberForm from "./form/TeamMemberForm";
import { TeamMemberFormValues } from "./types";
import { useAdminStatus } from "@/hooks/team/useAdminStatus";

const AddTeamMemberDialog = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const { isAdminUser, companyName, isLoading, error: statusError } = useAdminStatus();

  const onSubmit = async (data: TeamMemberFormValues) => {
    if (!isAdminUser) {
      toast.error("Only administrators can add team members");
      return;
    }
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // Add company name to the form data
      const formDataWithCompany = {
        ...data,
        companyName: companyName
      };

      // In a real app, this would send an invite to the email address
      console.log("Inviting team member:", formDataWithCompany);
      
      // Here you would typically call an API to send the invite
      // For now we'll just simulate a successful invite
      toast.success(`Invitation sent to ${data.email}`);
    } catch (err: any) {
      console.error("Error sending invitation:", err);
      setError(err.message || "Failed to send invitation");
      toast.error("Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Add New Team Member</DialogTitle>
        <DialogDescription>
          Enter the details of the new team member to invite them to the platform.
        </DialogDescription>
      </DialogHeader>
      
      {!isAdminUser && !isLoading && (
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
        isDisabled={!isAdminUser || isLoading}
        companyName={companyName}
      />
    </DialogContent>
  );
};

export default AddTeamMemberDialog;
