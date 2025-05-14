
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, Clock, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AvatarUploader from "./AvatarUploader";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";

interface ProfileData {
  id: string;
  email: string;
  first_name: string | null;
  last_name: string | null;
  role: string;
  created_at: string;
  avatar_url: string | null;
  phone_number: string | null;
}

const ProfileInformation = () => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error("Not authenticated");
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        if (error) throw error;
        setProfileData(data);
        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          phone_number: data.phone_number ?? "",
          email: data.email ?? "",
        });
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfileData();
  }, []);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData) return;
    setIsSaving(true);
    const toUpdate = {
      first_name: form.first_name,
      last_name: form.last_name,
      phone_number: form.phone_number,
      email: form.email,
    };
    const { error } = await supabase
      .from("profiles")
      .update(toUpdate)
      .eq("id", profileData.id);
    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Profile Updated",
        description: "Your profile changes have been saved.",
      });
      setProfileData({ ...profileData, ...toUpdate });
      setEditMode(false);
    }
    setIsSaving(false);
  };

  const handleAvatarChange = async (avatar: string | null) => {
    if (!profileData) return;
    setIsSaving(true);
    // Simulate upload: in production, upload to Supabase storage instead.
    const { error } = await supabase
      .from("profiles")
      .update({ avatar_url: avatar })
      .eq("id", profileData.id);
    if (!error) {
      toast({
        title: "Avatar updated!",
        description: "Profile picture updated successfully.",
      });
      setProfileData((cur) =>
        cur ? { ...cur, avatar_url: avatar } : cur
      );
    } else {
      toast({
        title: "Avatar update failed",
        description: error.message,
        variant: "destructive",
      });
    }
    setIsSaving(false);
  };

  if (isLoading) {
    // Improved Skeleton experience and accessibility
    return (
      <Card role="status" aria-live="polite" aria-busy="true">
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Loading your profile information...</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-6">
          <div>
            <Skeleton className="w-24 h-24 rounded-full mb-2" aria-label="Profile avatar loading" />
            <Skeleton className="w-20 h-6" aria-label="User name loading" />
            <Skeleton className="w-24 h-4 mt-2" aria-label="Email loading" />
          </div>
          <div className="w-full space-y-4">
            <Skeleton className="h-8 w-48" aria-label="Name field loading" />
            <Skeleton className="h-8 w-48" aria-label="Email field loading" />
            <Skeleton className="h-8 w-36" aria-label="Phone field loading" />
          </div>
        </CardContent>
      </Card>
    );
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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }).format(date);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle as="h2" tabIndex={0}>User Profile</CardTitle>
        <CardDescription>Your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-6">
          <AvatarUploader 
            currentAvatarUrl={profileData.avatar_url} 
            onAvatarChange={handleAvatarChange}
            // aria-label + role for accessibility
            aria-label="Profile avatar, click to change"
            role="img"
          />
          <div className="w-full">
            {editMode ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4" aria-label="Edit profile form">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  <div>
                    <label htmlFor="first_name" className="block text-xs font-semibold mb-1">First Name</label>
                    <input
                      id="first_name"
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleFormChange}
                      className="w-full border rounded py-2 px-3"
                      disabled={isSaving}
                      aria-required="true"
                      aria-label="First Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="last_name" className="block text-xs font-semibold mb-1">Last Name</label>
                    <input
                      id="last_name"
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleFormChange}
                      className="w-full border rounded py-2 px-3"
                      disabled={isSaving}
                      aria-required="true"
                      aria-label="Last Name"
                    />
                  </div>
                  <div>
                    <label htmlFor="email" className="block text-xs font-semibold mb-1">Email</label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleFormChange}
                      className="w-full border rounded py-2 px-3"
                      disabled={isSaving}
                      aria-required="true"
                      aria-label="Email"
                    />
                  </div>
                  <div>
                    <label htmlFor="phone_number" className="block text-xs font-semibold mb-1">Phone Number</label>
                    <input
                      id="phone_number"
                      type="tel"
                      name="phone_number"
                      value={form.phone_number}
                      onChange={handleFormChange}
                      className="w-full border rounded py-2 px-3"
                      disabled={isSaving}
                      aria-label="Phone Number"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSaving} aria-label="Save changes">
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditMode(false)} disabled={isSaving} aria-label="Cancel editing">
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between items-center">
                  <h3 className="text-xl font-medium text-gray-900" tabIndex={0}>
                    {[profileData.first_name, profileData.last_name].filter(Boolean).join(" ") || "No name provided"}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setEditMode(true)} aria-label="Edit profile">
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
                      <span className={`${profileData.role === 'administrator' ? 'text-blue-600' : 'text-gray-600'} capitalize`}>
                        {profileData.role}
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
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInformation;
