
import React from "react";
import { AlertCircle } from "lucide-react";

const TeamMembersEmpty: React.FC = () => {
 return (
 <div className="text-center py-14">
 <div className="w-14 h-14 rounded-full bg-warning/10 flex items-center justify-center mx-auto mb-4">
 <AlertCircle className="h-7 w-7 text-warning" />
 </div>
 <p className="font-medium text-foreground">No team members found</p>
 <p className="mt-1 text-sm text-muted-foreground max-w-xs mx-auto">
 Make sure you are signed in and have team members registered in your organization.
 </p>
 </div>
 );
};

export default TeamMembersEmpty;
