
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { ProfileDisplay } from "./ProfileDisplay";
import { ProfileEditor } from "./ProfileEditor";
import { AvatarSection } from "./AvatarSection";
import { useProfile } from "@/hooks/profile/useProfile";
import { useProfileForm } from "@/hooks/profile/useProfileForm";
import { useAvatarUpload } from "@/hooks/profile/useAvatarUpload";

const ProfileInformation = () => {
  const [editMode, setEditMode] = useState(false);
  const { profile, isLoading, saveProfile } = useProfile();
  
  const profileForm = useProfileForm({
    initialData: profile!,
    onSave: saveProfile
  });
  
  const avatarUpload = useAvatarUpload(profile?.id);

  // Update avatar preview when profile data changes
  useEffect(() => {
    if (profile?.avatar_url) {
      avatarUpload.setPreviewUrl(profile.avatar_url);
    }
  }, [profile?.avatar_url, avatarUpload.setPreviewUrl]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    const success = await profileForm.handleSubmit(e);
    if (success) {
      setEditMode(false);
    }
    return success;
  };

  const handleCancelEdit = () => {
    profileForm.resetForm();
    setEditMode(false);
  };

  const handleAvatarUpload = async (file: File | null) => {
    try {
      await avatarUpload.handleFileUpload(file);
    } catch (error) {
      console.error("Avatar upload failed:", error);
    }
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Unable to load profile data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            There was an issue loading your profile information. Please try again later.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle tabIndex={0}>User Profile</CardTitle>
        <CardDescription>Your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-6">
          <AvatarSection 
            currentAvatarUrl={profile.avatar_url}
            preview={avatarUpload.preview}
            isUploading={avatarUpload.isUploading}
            onFileSelect={handleAvatarUpload}
            aria-label="Profile avatar, click to change"
          />
          <div className="w-full">
            {editMode ? (
              <ProfileEditor
                formData={profileForm.formData}
                errors={profileForm.errors}
                isSaving={profileForm.isSaving}
                onInputChange={profileForm.handleInputChange}
                onSubmit={handleSaveProfile}
                onCancel={handleCancelEdit}
              />
            ) : (
              <ProfileDisplay 
                profileData={profile} 
                onEditClick={() => setEditMode(true)} 
              />
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInformation;
