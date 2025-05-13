
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

const TeamMembersEmpty: React.FC = () => {
  return (
    <div className="text-center py-8">
      <Alert variant="destructive" className="max-w-md mx-auto bg-amber-50 border-amber-200">
        <AlertCircle className="h-5 w-5 text-amber-500" />
        <AlertDescription className="text-amber-800">
          No team members found. Make sure you are signed in and have team members registered in your organization.
          <br /><br />
          <span className="text-xs text-amber-700">
            (Check console logs for more details)
          </span>
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default TeamMembersEmpty;
