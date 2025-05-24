
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AvatarUploader from "./AvatarUploader";
import { useProfileData } from "./hooks/useProfileData";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { ProfileForm } from "./ProfileForm";
import { ProfileDisplay } from "./ProfileDisplay";

const ProfileInformation = () => {
  const [editMode, setEditMode] = useState(false);
  const {
    profileData,
    isLoading,
    isSaving,
    form,
    handleFormChange,
    handleProfileUpdate,
    updateAvatar,
  } = useProfileData();

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (!profileData) {
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

  const handleAvatarChange = async (avatar: string | null) => {
    await updateAvatar(avatar);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    const success = await handleProfileUpdate(e);
    if (success) {
      setEditMode(false);
    }
    return success;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle tabIndex={0}>User Profile</CardTitle>
        <CardDescription>Your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-6">
          <AvatarUploader 
            currentAvatarUrl={profileData.avatar_url} 
            onAvatarChange={handleAvatarChange}
            aria-label="Profile avatar, click to change"
          />
          <div className="w-full">
            {editMode ? (
              <ProfileForm
                form={form}
                isSaving={isSaving}
                onFormChange={handleFormChange}
                onSubmit={handleSubmit}
                onCancel={() => setEditMode(false)}
              />
            ) : (
              <ProfileDisplay 
                profileData={profileData} 
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
