
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
      <div className="flex justify-between items-center mb-1">
        <h3 className="text-xl font-semibold text-foreground" tabIndex={0}>
          {[profileData.first_name, profileData.last_name].filter(Boolean).join(" ") || "No name provided"}
        </h3>
        <Button
          variant="outline"
          size="sm"
          onClick={onEditClick}
          aria-label="Edit profile"
          className="border-border text-primary hover:bg-primary/5"
        >
          <Pencil className="w-4 h-4 mr-1" aria-hidden="true" />
          Edit
        </Button>
      </div>
      <div className="text-sm text-muted-foreground mb-4" tabIndex={0}>
        {profileData.email}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
          <Shield className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Role</p>
            <p className={`text-sm font-medium ${profileData.role === "administrator" ? "text-primary" : "text-foreground"}`}>
              {formatRole(profileData.role)}
            </p>
          </div>
        </div>
        {profileData.phone_number && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Phone</p>
              <p className="text-sm font-medium text-foreground">{profileData.phone_number}</p>
            </div>
          </div>
        )}
        <div className="flex items-center gap-2 p-3 rounded-lg bg-background border border-border">
          <Clock className="h-4 w-4 text-muted-foreground shrink-0" aria-hidden="true" />
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide font-semibold">Member since</p>
            <p className="text-sm font-medium text-foreground">{formatDate(profileData.created_at)}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
