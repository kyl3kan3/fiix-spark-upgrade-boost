
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
      id: "",
      email: "",
      first_name: "",
      last_name: "",
      phone_number: "",
      role: "user",
      company_id: "",
      company_name: "",
      created_at: "",
      avatar_url: null,
    },
    onSave: saveProfile,
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
    } catch (err) {
      console.error("Avatar upload failed:", err);
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
      <Card className="bg-card border border-border rounded-lg shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="font-headline text-xl text-foreground">User Profile</CardTitle>
          <CardDescription className="text-muted-foreground">Error loading profile data</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <Alert className="bg-destructive/10 border-destructive/30">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-destructive">{error}</AlertDescription>
          </Alert>
          <Button onClick={handleRetry} variant="outline" className="border-border text-primary hover:bg-primary/5">
            <RefreshCw className="h-4 w-4 mr-2" />
            Retry Loading Profile
          </Button>
        </CardContent>
      </Card>
    );
  }

  if (!profile) {
    return (
      <Card className="bg-card border border-border rounded-lg shadow-sm">
        <CardHeader className="border-b border-border pb-4">
          <CardTitle className="font-headline text-xl text-foreground">User Profile</CardTitle>
          <CardDescription className="text-muted-foreground">Unable to load profile data</CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-4">
          <p className="text-muted-foreground">
            There was an issue loading your profile information.
          </p>
          <Button onClick={handleRetry} variant="outline" className="border-border text-primary hover:bg-primary/5">
            <RefreshCw className="h-4 w-4 mr-2" />
            Try Again
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
      <CardHeader className="border-b border-border pb-4">
        <CardTitle className="font-headline text-xl text-foreground" tabIndex={0}>
          User Profile
        </CardTitle>
        <CardDescription className="text-muted-foreground">Your personal information</CardDescription>
      </CardHeader>
      <CardContent className="pt-6">
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
