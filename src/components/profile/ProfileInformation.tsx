
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Clock, Pencil } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import AvatarUploader from "./AvatarUploader";
import { Button } from "@/components/ui/button";
import { toast } from "@/hooks/use-toast";

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
    return (
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
          <CardDescription>Loading your profile information...</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="h-6 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-100 rounded animate-pulse"></div>
          <div className="h-6 bg-gray-100 rounded animate-pulse"></div>
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
        <CardTitle>User Profile</CardTitle>
        <CardDescription>Your personal information</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-6">
          <AvatarUploader currentAvatarUrl={profileData.avatar_url} onAvatarChange={handleAvatarChange} />
          <div className="w-full">
            {editMode ? (
              <form onSubmit={handleProfileUpdate} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2">
                  <div>
                    <label className="block text-xs font-semibold mb-1">First Name</label>
                    <input
                      type="text"
                      name="first_name"
                      value={form.first_name}
                      onChange={handleFormChange}
                      className="w-full border rounded py-2 px-3"
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Last Name</label>
                    <input
                      type="text"
                      name="last_name"
                      value={form.last_name}
                      onChange={handleFormChange}
                      className="w-full border rounded py-2 px-3"
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Email</label>
                    <input
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleFormChange}
                      className="w-full border rounded py-2 px-3"
                      disabled={isSaving}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold mb-1">Phone Number</label>
                    <input
                      type="tel"
                      name="phone_number"
                      value={form.phone_number}
                      onChange={handleFormChange}
                      className="w-full border rounded py-2 px-3"
                      disabled={isSaving}
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button type="submit" disabled={isSaving}>
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button type="button" variant="outline" onClick={() => setEditMode(false)} disabled={isSaving}>
                    Cancel
                  </Button>
                </div>
              </form>
            ) : (
              <div>
                <div className="flex justify-between">
                  <h3 className="text-xl font-medium text-gray-900">
                    {[profileData.first_name, profileData.last_name].filter(Boolean).join(" ") || "No name provided"}
                  </h3>
                  <Button variant="ghost" size="sm" onClick={() => setEditMode(true)}>
                    <Pencil className="w-4 h-4" />
                    Edit
                  </Button>
                </div>
                <div className="text-muted-foreground">{profileData.email}</div>
                <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                  <div className="flex items-center gap-2">
                    <Shield className="h-5 w-5 text-gray-500" />
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
                    <Clock className="h-5 w-5 text-gray-500" />
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
