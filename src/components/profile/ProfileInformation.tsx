
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AvatarUploader from "./AvatarUploader";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { ProfileForm } from "./ProfileForm";
import { ProfileDisplay } from "./ProfileDisplay";
import { useProfile } from "@/hooks/profile/useProfile";
import { ProfileFormData } from "./types";
import { toast } from "sonner";

const ProfileInformation = () => {
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { profile, isLoading, saveProfile, updateAvatar } = useProfile();
  const [form, setForm] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
  });

  // Update form when profile data changes
  useEffect(() => {
    if (profile) {
      setForm({
        first_name: profile.first_name || "",
        last_name: profile.last_name || "",
        phone_number: profile.phone_number || "",
        email: profile.email || "",
      });
    }
  }, [profile]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return false;
    
    setIsSaving(true);
    try {
      await saveProfile({
        first_name: form.first_name,
        last_name: form.last_name,
        phone_number: form.phone_number,
        email: form.email,
      });
      
      toast.success("Profile Updated", {
        description: "Your profile changes have been saved."
      });
      setEditMode(false);
      return true;
    } catch (error) {
      console.error("Failed to update profile:", error);
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (avatar: string | null) => {
    // Convert string URL to null for removal, or handle file upload differently
    await updateAvatar(null);
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
          <AvatarUploader 
            currentAvatarUrl={profile.avatar_url} 
            onAvatarChange={handleAvatarChange}
            aria-label="Profile avatar, click to change"
          />
          <div className="w-full">
            {editMode ? (
              <ProfileForm
                form={form}
                isSaving={isSaving}
                onFormChange={handleFormChange}
                onSubmit={handleProfileUpdate}
                onCancel={() => setEditMode(false)}
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
