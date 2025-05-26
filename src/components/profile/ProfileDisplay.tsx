
import React from "react";
import { Button } from "@/components/ui/button";
import { Shield, Clock, Pencil } from "lucide-react";
import { ProfileData } from "./types";

interface ProfileDisplayProps {
  profileData: ProfileData;
  onEditClick: () => void;
}

export const ProfileDisplay: React.FC<ProfileDisplayProps> = ({ profileData, onEditClick }) => {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  const formatRole = (role: string) => {
    // Capitalize the role for display
    return role.charAt(0).toUpperCase() + role.slice(1);
  };

  return (
    <div>
      <div className="flex justify-between items-center">
        <h3 className="text-xl font-medium text-gray-900" tabIndex={0}>
          {[profileData.first_name, profileData.last_name].filter(Boolean).join(" ") || "No name provided"}
        </h3>
        <Button variant="ghost" size="sm" onClick={onEditClick} aria-label="Edit profile">
          <Pencil className="w-4 h-4" aria-hidden="true" />
          <span>Edit</span>
        </Button>
      </div>
      <div className="text-muted-foreground" tabIndex={0}>{profileData.email}</div>
      <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-gray-500" aria-hidden="true" />
          <span>
            <span className="font-medium">Role:</span>{" "}
            <span className={`${profileData.role === 'administrator' ? 'text-blue-600' : 'text-gray-600'}`}>
              {formatRole(profileData.role)}
            </span>
          </span>
        </div>
        {profileData.phone_number && (
          <div className="flex items-center gap-2">
            <span className="font-medium">Phone:</span>{" "}
            <span>{profileData.phone_number}</span>
          </div>
        )}
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-gray-500" aria-hidden="true" />
          <span>
            <span className="font-medium">Member since:</span>{" "}
            <span>{formatDate(profileData.created_at)}</span>
          </span>
        </div>
      </div>
    </div>
  );
};
