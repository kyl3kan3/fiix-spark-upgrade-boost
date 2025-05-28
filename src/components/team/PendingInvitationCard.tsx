
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Mail, Send } from "lucide-react";
import { PendingInvitation } from "@/hooks/team/usePendingInvitations";
import { useTeamInvitation } from "@/hooks/team/useTeamInvitation";
import { toast } from "sonner";

interface PendingInvitationCardProps {
  invitation: PendingInvitation;
  roleColorMap: Record<string, string>;
}

const PendingInvitationCard: React.FC<PendingInvitationCardProps> = ({ 
  invitation, 
  roleColorMap 
}) => {
  const { sendInvitation, isSubmitting } = useTeamInvitation();

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleResend = async () => {
    console.log("Resending invitation to:", invitation.email);
    // Pass true as the second parameter to indicate this is a resend
    const result = await sendInvitation(invitation.email, true);
    if (result) {
      console.log("Resend successful for:", invitation.email);
    }
  };

  return (
    <Card className="h-full border-dashed border-2 border-gray-200 bg-gray-50">
      <CardContent className="p-4 space-y-4">
        <div className="flex items-start justify-between">
          <div className="flex items-center space-x-3 min-w-0 flex-1">
            <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center flex-shrink-0">
              <Mail className="h-5 w-5 text-gray-500" />
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-medium text-gray-900 truncate" title={invitation.email}>
                {invitation.email}
              </h3>
              <p className="text-sm text-gray-500">Invitation pending</p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={`${roleColorMap[invitation.role] || "bg-gray-100 text-gray-800"} flex-shrink-0 ml-2`}
          >
            {invitation.role}
          </Badge>
        </div>
        
        <div className="flex items-center text-sm text-gray-500">
          <Clock className="h-4 w-4 mr-1 flex-shrink-0" />
          <span className="truncate">Invited on {formatDate(invitation.created_at)}</span>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="text-xs text-orange-600 font-medium">
            ⏳ Waiting for acceptance
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResend}
            disabled={isSubmitting}
            className="flex items-center space-x-1"
          >
            <Send className="h-3 w-3" />
            <span>Resend</span>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingInvitationCard;
