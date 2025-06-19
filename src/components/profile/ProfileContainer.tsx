
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { ProfileContent } from "./ProfileContent";
import { useProfile } from "@/hooks/profile/useProfile";
import { useProfileForm } from "@/hooks/profile/useProfileForm";
import { useAvatarUpload } from "@/hooks/profile/useAvatarUpload";

const ProfileContainer: React.FC = () => {
  const [editMode, setEditMode] = useState(false);
  const { profile, isLoading, error, refreshProfile, saveProfile } = useProfile();
  
  // Only initialize form when profile is loaded
  const profileForm = useProfileForm({
    initialData: profile || {
      id: '',
      email: '',
      first_name: '',
      last_name: '',
      phone_number: '',
      role: 'user',
      company_id: '',
      company_name: '',
      created_at: '',
      avatar_url: null
    },
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

  const handleRetry = () => {
    refreshProfile();
  };

  if (isLoading) {
    return <ProfileSkeleton />;
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Error loading profile data</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert className="mb-4 bg-red-50 border-red-200">
            <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
            <AlertDescription className="text-red-700">
              {error}
            </AlertDescription>
          </Alert>
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Loading Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Unable to load profile data</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-4">
            There was an issue loading your profile information.
          </p>
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
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
