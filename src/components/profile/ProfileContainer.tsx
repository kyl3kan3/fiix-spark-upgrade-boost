
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { ProfileContent } from "./ProfileContent";
import { useProfile } from "@/hooks/profile/useProfile";
import { useProfileForm } from "@/hooks/profile/useProfileForm";
import { useAvatarUpload } from "@/hooks/profile/useAvatarUpload";

const ProfileContainer: React.FC = () => {
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
        <ProfileContent
          profile={profile}
          editMode={editMode}
          profileForm={profileForm}
          avatarUpload={avatarUpload}
          onSaveProfile={handleSaveProfile}
          onCancelEdit={handleCancelEdit}
          onAvatarUpload={handleAvatarUpload}
          onEditClick={() => setEditMode(true)}
        />
      </CardContent>
    </Card>
  );
};

export default ProfileContainer;
