import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { ProfileData, ProfileFormData } from "../types";
import { toast } from "@/hooks/use-toast";

export function useProfileData() {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [form, setForm] = useState<ProfileFormData>({
    first_name: "",
    last_name: "",
    phone_number: "",
    email: "",
  });

  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        console.log("Not authenticated, cannot load profile");
        setIsLoading(false);
        setProfileError(new Error("Not authenticated"));
        return;
      }
      
      // Using maybeSingle() instead of single() to handle case where profile doesn't exist
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .maybeSingle();
        
      if (error) {
        console.error("Error fetching profile data:", error);
        throw error;
      }
      
      console.log("Profile data fetch result:", { data, userId: user.id });
      
      if (!data) {
        console.log("No profile data found, attempting to create one");
        const createdProfile = await createInitialProfile(user.id, user.email || undefined);
        
        if (createdProfile) {
          setProfileData(createdProfile);
          setForm({
            first_name: createdProfile.first_name ?? "",
            last_name: createdProfile.last_name ?? "",
            phone_number: createdProfile.phone_number ?? "",
            email: createdProfile.email ?? "",
          });
        } else {
          throw new Error("Failed to create or fetch profile");
        }
      } else {
        setProfileData(data);
        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          phone_number: data.phone_number ?? "",
          email: data.email ?? "",
        });
      }
    } catch (error: any) {
      console.error("Error fetching profile data:", error);
      toast({
        title: "Error loading profile",
        description: "Please try refreshing the page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Function to create an initial profile if none exists
  const createInitialProfile = async (userId: string, email: string | undefined): Promise<ProfileData | null> => {
    try {
      // First check if there's any company in the system to associate with
      const { data: companyData } = await supabase
        .from('companies')
        .select('id')
        .limit(1)
        .maybeSingle();

      // Create initial profile with company_id if available
      const newProfile = {
        id: userId,
        email: email || "",
        first_name: "",
        last_name: "",
        role: "technician",
        company_id: companyData?.id || null,  // Make this optional
        created_at: new Date().toISOString(),
        avatar_url: null,
        phone_number: null
      };

      const { data, error } = await supabase
        .from('profiles')
        .upsert(newProfile)
        .select('*')
        .single();

      if (error) {
        console.error("Error creating profile:", error);
        throw error;
      }

      console.log("Created new profile:", data);
      return data;
    } catch (error: any) {
      console.error("Failed to create initial profile:", error);
      return null;
    }
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateProfile = async (updatedData: Partial<ProfileData>) => {
    if (!profileData) return false;
    
    setIsSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update(updatedData)
      .eq("id", profileData.id);
      
    if (error) {
      toast({
        title: "Update failed",
        description: error.message,
        variant: "destructive",
      });
      setIsSaving(false);
      return false;
    }
    
    // Update local state with new data
    setProfileData(prev => prev ? { ...prev, ...updatedData } : null);
    setIsSaving(false);
    return true;
  };

  const handleProfileUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profileData) return;
    
    const toUpdate = {
      first_name: form.first_name,
      last_name: form.last_name,
      phone_number: form.phone_number,
      email: form.email,
    };
    
    const success = await updateProfile(toUpdate);
    
    if (success) {
      toast({
        title: "Profile Updated",
        description: "Your profile changes have been saved.",
      });
    }
    
    return success;
  };

  const updateAvatar = async (avatar: string | null) => {
    const success = await updateProfile({ avatar_url: avatar });
    
    if (success) {
      toast({
        title: "Avatar updated!",
        description: "Profile picture updated successfully.",
      });
    }
    
    return success;
  };

  return {
    profileData,
    isLoading,
    isSaving,
    form,
    handleFormChange,
    handleProfileUpdate,
    updateAvatar,
    refreshProfile: fetchProfileData
  };
}
