
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import TeamMemberCard from "./TeamMemberCard";
import { Loader2, AlertCircle, ShieldAlert } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { supabase } from "@/integrations/supabase/client";

interface TeamMember {
  id: string | number;  // Support both string and number types
  name: string;
  role: string;
  email: string;
  phone: string;
  avatar: string;
  joined: string;
  lastActive: string;
  firstName?: string;
  lastName?: string;
  online?: boolean;
}

interface TeamMembersListProps {
  members: TeamMember[];
  roleColorMap: Record<string, string>;
  loading?: boolean;
  onMemberUpdated: (userId: string, updates: {
    firstName?: string;
    lastName?: string;
    role?: string;
    email?: string;
  }) => void;
}

const TeamMembersList: React.FC<TeamMembersListProps> = ({ 
  members, 
  roleColorMap, 
  loading = false,
  onMemberUpdated
}) => {
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [checkingPermissions, setCheckingPermissions] = useState(true);
  
  // Check current user's role on component mount
  useEffect(() => {
    const checkCurrentUserRole = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("Not authenticated");
        }
        
        // Get current user's role from profiles
        const { data, error } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setCurrentUserRole(data?.role || null);
      } catch (error) {
        console.error("Error checking user role:", error);
      } finally {
        setCheckingPermissions(false);
      }
    };
    
    checkCurrentUserRole();
  }, []);
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Team Directory</CardTitle>
        <CardDescription>
          View and manage permissions for all maintenance team members
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading || checkingPermissions ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="p-6">
                  <div className="flex items-start gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-5 w-40 mb-2" />
                      <Skeleton className="h-4 w-20 mb-3" />
                      <Skeleton className="h-3 w-32 mb-1" />
                      <Skeleton className="h-3 w-28 mb-3" />
                      <Skeleton className="h-3 w-24" />
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-6 py-3 flex items-center justify-between">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : members.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {members.map((member) => (
              <TeamMemberCard 
                key={member.id} 
                member={member}
                roleColorMap={roleColorMap} 
                onMemberUpdated={onMemberUpdated}
              />
            ))}
          </div>
        ) : (
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
        )}
      </CardContent>
      
      {/* Show permission notice if user is not an admin */}
      {currentUserRole && currentUserRole !== 'administrator' && !loading && !checkingPermissions && (
        <CardFooter className="pt-0">
          <Alert className="w-full bg-amber-50 border-amber-200">
            <ShieldAlert className="h-5 w-5 text-amber-600 mr-2" />
            <AlertDescription className="text-amber-800">
              You need administrator privileges to change user roles. 
              Your current role: <strong>{currentUserRole}</strong>
            </AlertDescription>
          </Alert>
        </CardFooter>
      )}
    </Card>
  );
};

export default TeamMembersList;
