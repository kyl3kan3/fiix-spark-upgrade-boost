
import React, { useEffect, useState } from "react";
import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProfileInformation from "@/components/profile/ProfileInformation";
import CompanyInformation from "@/components/profile/CompanyInformation";
import SetAdminUser from "@/components/admin/SetAdminUser";
import DeleteAccountButton from "@/components/profile/DeleteAccountButton";
import SignOutButton from "./SignOutButton";
import { supabase } from "@/integrations/supabase/client";

interface ProfileTabContentProps {
  refreshKey: number;
}

export const ProfileTabContent: React.FC<ProfileTabContentProps> = ({ refreshKey }) => {
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Effect to get user email from supabase for the admin section
  useEffect(() => {
    const loadUserEmail = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUserEmail(user?.email ?? null);
      } catch (err) {
        console.error("Error getting user email:", err);
      }
    };
    
    loadUserEmail();
  }, [refreshKey]);

  return (
    <div className="space-y-8">
      {/* Profile Information */}
      <ProfileInformation key={`profile-info-${refreshKey}`} />
      
      {/* Company Information */}
      <CompanyInformation key={`company-info-${refreshKey}`} />
      
      {/* Administrator Access */}
      <Alert className="mb-4 bg-blue-50 border-blue-200">
        <InfoIcon className="h-4 w-4 text-blue-500 mr-2" />
        <AlertDescription className="text-blue-700">
          Administrator access lets you manage all users and system settings
        </AlertDescription>
      </Alert>
      
      {/* Use currently logged-in user for admin section */}
      <SetAdminUser email={userEmail ?? undefined} />
      <DeleteAccountButton />
      
      {/* Sign out button */}
      <div className="flex justify-end pt-2">
        <SignOutButton />
      </div>
    </div>
  );
};
