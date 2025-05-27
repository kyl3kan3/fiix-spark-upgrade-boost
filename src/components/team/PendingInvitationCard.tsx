
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, Mail } from "lucide-react";
import { PendingInvitation } from "@/hooks/team/usePendingInvitations";

interface PendingInvitationCardProps {
  invitation: PendingInvitation;
  roleColorMap: Record<string, string>;
}

const PendingInvitationCard: React.FC<PendingInvitationCardProps> = ({ 
  invitation, 
  roleColorMap 
}) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className="h-full border-dashed border-2 border-gray-200 bg-gray-50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
              <Mail className="h-5 w-5 text-gray-500" />
            </div>
            <div>
              <h3 className="font-medium text-gray-900">{invitation.email}</h3>
              <p className="text-sm text-gray-500">Invitation pending</p>
            </div>
          </div>
          <Badge variant="outline" className={roleColorMap[invitation.role] || "bg-gray-100 text-gray-800"}>
            {invitation.role}
          </Badge>
        </div>
        
        <div className="mt-4 flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1" />
          <span>Invited on {formatDate(invitation.created_at)}</span>
        </div>
        
        <div className="mt-2 text-xs text-orange-600 font-medium">
          ⏳ Waiting for acceptance
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingInvitationCard;
