
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
 <Card className="bg-card border border-border shadow-sm">
 <CardHeader>
 <CardTitle className="font-headline text-xl">Pending Invitations</CardTitle>
 <CardDescription>
 Team members who have been invited but haven't joined yet
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="text-center py-8">
 <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
 <p className="mt-2 text-sm text-muted-foreground">Loading pending invitations...</p>
 </div>
 </CardContent>
 </Card>
 );
 }

 if (invitations.length === 0) {
 return (
 <Card className="bg-card border border-border shadow-sm">
 <CardHeader>
 <CardTitle className="font-headline text-xl">Pending Invitations</CardTitle>
 <CardDescription>
 Team members who have been invited but haven't joined yet
 </CardDescription>
 </CardHeader>
 <CardContent>
 <div className="text-center py-10">
 <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
 <Mail className="h-7 w-7 text-primary" />
 </div>
 <p className="font-medium text-foreground">No pending invitations</p>
 <p className="text-sm text-muted-foreground mt-1">
 All invited team members have already joined
 </p>
 </div>
 </CardContent>
 </Card>
 );
 }

 return (
 <Card className="bg-card border border-border shadow-sm">
 <CardHeader>
 <CardTitle className="font-headline text-xl">Pending Invitations ({invitations.length})</CardTitle>
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
