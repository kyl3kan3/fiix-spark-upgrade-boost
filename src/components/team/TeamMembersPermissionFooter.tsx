
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
 <Alert className="w-full bg-warning/10 border-warning/30">
 <ShieldAlert className="h-5 w-5 text-warning mr-2" />
 <AlertDescription className="text-foreground">
 You need administrator privileges to change user roles.
 Your current role: <strong>{currentUserRole}</strong>
 </AlertDescription>
 </Alert>
 </CardFooter>
 );
};

export default TeamMembersPermissionFooter;
