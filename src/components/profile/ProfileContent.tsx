
import React from "react";
import { ProfileDisplay } from "./ProfileDisplay";
import { ProfileEditor } from "./ProfileEditor";
import { AvatarSection } from "./AvatarSection";
import { ProfileData } from "./types";

interface ProfileContentProps {
  profile: ProfileData;
  editMode: boolean;
  profileForm: any;
  avatarUpload: any;
  onSaveProfile: (e: React.FormEvent) => Promise<boolean>;
  onCancelEdit: () => void;
  onAvatarUpload: (file: File | null) => void;
  onEditClick: () => void;
}

export const ProfileContent: React.FC<ProfileContentProps> = ({
  profile,
  editMode,
  profileForm,
  avatarUpload,
  onSaveProfile,
  onCancelEdit,
  onAvatarUpload,
  onEditClick,
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-6">
      <AvatarSection 
        currentAvatarUrl={profile.avatar_url}
        preview={avatarUpload.preview}
        isUploading={avatarUpload.isUploading}
        onFileSelect={onAvatarUpload}
        aria-label="Profile avatar, click to change"
      />
      <div className="w-full">
        {editMode ? (
          <ProfileEditor
            formData={profileForm.formData}
            errors={profileForm.errors}
            isSaving={profileForm.isSaving}
            onInputChange={profileForm.handleInputChange}
            onSubmit={onSaveProfile}
            onCancel={onCancelEdit}
          />
        ) : (
          <ProfileDisplay 
            profileData={profile} 
            onEditClick={onEditClick} 
          />
        )}
      </div>
    </div>
  );
};
