
import React from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ShieldAlert } from "lucide-react";
import { CardFooter } from "@/components/ui/card";

interface TeamMembersPermissionFooterProps {
  currentUserRole: string | null;
}

const TeamMembersPermissionFooter: React.FC<TeamMembersPermissionFooterProps> = ({ currentUserRole }) => {
  if (!currentUserRole || currentUserRole === 'administrator') {
    return null;
  }
  
  return (
    <CardFooter className="pt-0">
      <Alert className="w-full bg-amber-50 border-amber-200">
        <ShieldAlert className="h-5 w-5 text-amber-600 mr-2" />
        <AlertDescription className="text-amber-800">
          You need administrator privileges to change user roles. 
          Your current role: <strong>{currentUserRole}</strong>
        </AlertDescription>
      </Alert>
    </CardFooter>
  );
};

export default TeamMembersPermissionFooter;
