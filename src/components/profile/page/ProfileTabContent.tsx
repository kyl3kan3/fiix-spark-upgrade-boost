
import React, { useEffect, useState } from "react";
import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProfileInformation from "@/components/profile/ProfileInformation";
import CompanyInformation from "@/components/profile/CompanyInformation";
import SetAdminUser from "@/components/admin/SetAdminUser";
import DeleteAccountButton from "@/components/profile/DeleteAccountButton";
import SignOutButton from "./SignOutButton";
import { useAuth } from "@/contexts/AuthContext";

interface ProfileTabContentProps {
  refreshKey: number;
}

export const ProfileTabContent: React.FC<ProfileTabContentProps> = ({ refreshKey }) => {
  const { user } = useAuth();
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  // Effect to get user email
  useEffect(() => {
    if (user?.email) {
      setUserEmail(user.email);
    }
  }, [user, refreshKey]);

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
