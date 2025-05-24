
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import AvatarUploader from "./AvatarUploader";
import { ProfileSkeleton } from "./ProfileSkeleton";
import { ProfileForm } from "./ProfileForm";
import { ProfileDisplay } from "./ProfileDisplay";
import { useSimpleProfile } from "@/hooks/profile/useSimpleProfile";
import { ProfileFormData } from "./types";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const ProfileInformation = () => {
  const [editMode, setEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { profileData, isLoading, refreshProfile } = useSimpleProfile();
  const [form, setForm] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
  });

  // Update form when profile data changes
  useEffect(() => {
    if (profileData) {
      setForm({
        first_name: profileData.first_name || "",
        last_name: profileData.last_name || "",
        phone_number: profileData.phone_number || "",
        email: profileData.email || "",
      });
    }
  }, [profileData]);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData) return false;
    
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from("profiles")
        .update({
          first_name: form.first_name,
          last_name: form.last_name,
          phone_number: form.phone_number,
          email: form.email,
        })
        .eq("id", profileData.id);
        
      if (error) {
        toast.error("Update failed", {
          description: error.message,
        });
        return false;
      }
      
      toast.success("Profile Updated", {
        description: "Your profile changes have been saved."
      });
      
      await refreshProfile();
      setEditMode(false);
      return true;
    } catch (error: any) {
      console.error("Error updating profile:", error);
      toast.error("Update failed", {
        description: error.message,
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  };

  const handleAvatarChange = async (avatar: string | null) => {
    if (!profileData) return;
    
    try {
      const { error } = await supabase
        .from("profiles")
        .update({ avatar_url: avatar })
        .eq("id", profileData.id);
        
      if (error) {
        toast.error("Avatar update failed", {
          description: error.message,
        });
        return;
      }
      
      toast.success("Avatar updated!");
      await refreshProfile();
    } catch (error: any) {
      console.error("Error updating avatar:", error);
      toast.error("Avatar update failed");
    }
  };

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
                onSubmit={handleProfileUpdate}
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
