
import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Mail, Send, Trash2 } from "lucide-react";
import { PendingInvitation } from "@/hooks/team/usePendingInvitations";
import { useTeamInvitation } from "@/hooks/team/useTeamInvitation";
import { deleteInvitation } from "@/services/team/invitationService";
import { toast } from "sonner";
import { logger } from "@/lib/logger";

interface PendingInvitationCardProps {
 invitation: PendingInvitation;
 roleColorMap: Record<string, string>;
 onInvitationDeleted?: () => void;
}

const PendingInvitationCard: React.FC<PendingInvitationCardProps> = ({ 
 invitation, 
 roleColorMap,
 onInvitationDeleted 
}) => {
 const { sendInvitation, isSubmitting } = useTeamInvitation();

 const formatDate = (dateString: string) => {
 return new Date(dateString).toLocaleDateString();
 };

 const handleResend = async () => {
 logger.log("Resending invitation to:", invitation.email);
 // Pass true as the second parameter to indicate this is a resend
 const result = await sendInvitation(invitation.email, true);
 if (result) {
 logger.log("Resend successful for:", invitation.email);
 }
 };

 const handleDelete = async () => {
 try {
 await deleteInvitation(invitation.id);
 toast.success("Invitation deleted successfully");
 onInvitationDeleted?.();
 } catch (error: any) {
 console.error("Error deleting invitation:", error);
 toast.error("Failed to delete invitation");
 }
 };

 return (
 <Card className="h-full border border-border border-dashed bg-card/50 hover:shadow-md transition-ui duration-200">
 <CardContent className="p-5 space-y-4">
 <div className="flex items-start justify-between gap-2">
 <div className="flex items-center space-x-3 min-w-0 flex-1">
 <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
 <Mail className="h-5 w-5 text-primary" />
 </div>
 <div className="min-w-0 flex-1">
 <h3 className="font-medium text-foreground truncate text-sm" title={invitation.email}>
 {invitation.email}
 </h3>
 <p className="text-xs text-muted-foreground">Invitation pending</p>
 </div>
 </div>
 <Badge
 variant="outline"
 className={`${roleColorMap[invitation.role] || "bg-muted text-muted-foreground"} flex-shrink-0 text-xs rounded-full px-3`}
 >
 {invitation.role}
 </Badge>
 </div>

 <div className="flex items-center text-xs text-muted-foreground">
 <Clock className="h-3.5 w-3.5 mr-1 flex-shrink-0" />
 <span className="truncate">Invited on {formatDate(invitation.created_at)}</span>
 </div>

 <div className="flex items-center justify-between">
 <div className="text-xs text-warning font-medium">
 Waiting for acceptance
 </div>
 <div className="flex items-center space-x-2">
 <Button
 variant="outline"
 size="sm"
 onClick={handleResend}
 disabled={isSubmitting}
 className="flex items-center space-x-1 text-xs h-7"
 >
 <Send className="h-3 w-3" />
 <span>Resend</span>
 </Button>
 <Button
 variant="outline"
 size="sm"
 onClick={handleDelete}
 disabled={isSubmitting}
 className="flex items-center space-x-1 text-xs h-7 text-destructive hover:text-destructive hover:bg-destructive/10"
 >
 <Trash2 className="h-3 w-3" />
 <span>Delete</span>
 </Button>
 </div>
 </div>
 </CardContent>
 </Card>
 );
};

export default PendingInvitationCard;
