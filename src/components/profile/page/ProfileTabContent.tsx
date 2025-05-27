
import React from "react";
import { InfoIcon } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import ProfileInformation from "@/components/profile/ProfileInformation";
import CompanyInformation from "@/components/profile/CompanyInformation";
import SetAdminUser from "@/components/admin/SetAdminUser";
import DeleteAccountButton from "@/components/profile/DeleteAccountButton";
import SignOutButton from "./SignOutButton";
import { useAuth } from "@/hooks/auth";

interface ProfileTabContentProps {
  refreshKey: number;
}

export const ProfileTabContent: React.FC<ProfileTabContentProps> = ({ refreshKey }) => {
  const { user } = useAuth();
  
  // Show loading if user is not available
  if (!user) {
    return (
      <div className="space-y-8">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

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
      <SetAdminUser email={user.email ?? undefined} />
      <DeleteAccountButton />
      
      {/* Sign out button */}
      <div className="flex justify-end pt-2">
        <SignOutButton />
      </div>
    </div>
  );
};
