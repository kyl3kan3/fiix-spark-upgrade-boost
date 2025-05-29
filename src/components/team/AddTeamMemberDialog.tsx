
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
  const [debugStatus, setDebugStatus] = useState<string[]>([]);

  const handleSubmit = async (data: TeamMemberFormValues) => {
    console.log("=== DIALOG SUBMISSION START ===");
    console.log("AddTeamMemberDialog handleSubmit called with:", data);
    console.log("Current user in dialog:", user);
    console.log("Dialog state:", { isSubmitting, error });
    
    // Clear previous debug messages
    setDebugStatus([]);
    
    try {
      setDebugStatus(prev => [...prev, "🚀 Starting invitation process..."]);
      
      const success = await sendInvitation(data.email);
      
      if (success) {
        setDebugStatus(prev => [...prev, "✅ Invitation sent successfully!"]);
      } else {
        setDebugStatus(prev => [...prev, "❌ Invitation failed to send"]);
      }
      
      console.log("Dialog submission result:", success);
      return success;
    } catch (error) {
      console.error("Error in dialog handleSubmit:", error);
      setDebugStatus(prev => [...prev, `💥 Error: ${error.message || 'Unknown error'}`]);
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
      
      {/* Debug Status Display */}
      {debugStatus.length > 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3 mb-4">
          <h4 className="font-medium text-blue-900 mb-2">Status:</h4>
          <div className="space-y-1">
            {debugStatus.map((status, index) => (
              <div key={index} className="text-sm text-blue-800">
                {status}
              </div>
            ))}
          </div>
        </div>
      )}
      
      {error && (
        <div className="text-red-600 text-sm mb-4 p-3 bg-red-50 rounded-md">
          <strong>Error:</strong> {error}
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
