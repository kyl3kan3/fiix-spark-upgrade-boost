
import React from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail } from "lucide-react";
import PendingInvitationCard from "./PendingInvitationCard";
import { PendingInvitation } from "@/hooks/team/usePendingInvitations";

interface PendingInvitationsSectionProps {
  invitations: PendingInvitation[];
  roleColorMap: Record<string, string>;
  loading?: boolean;
  onInvitationDeleted?: () => void;
}

const PendingInvitationsSection: React.FC<PendingInvitationsSectionProps> = ({ 
  invitations, 
  roleColorMap, 
  loading = false,
  onInvitationDeleted 
}) => {
  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            Team members who have been invited but haven't joined yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-sm text-gray-500">Loading pending invitations...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (invitations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Pending Invitations</CardTitle>
          <CardDescription>
            Team members who have been invited but haven't joined yet
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Mail className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No pending invitations</p>
            <p className="text-sm text-gray-400 mt-1">
              All invited team members have already joined
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Pending Invitations ({invitations.length})</CardTitle>
        <CardDescription>
          Team members who have been invited but haven't joined yet
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {invitations.map((invitation) => (
            <PendingInvitationCard 
              key={invitation.id} 
              invitation={invitation}
              roleColorMap={roleColorMap}
              onInvitationDeleted={onInvitationDeleted}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
};

export default PendingInvitationsSection;
