
import React, { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { User, Shield, Clock } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

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

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        setIsLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error("Not authenticated");
        }
        
        // Get user's profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (error) throw error;
        
        setProfileData(data);
      } catch (error) {
        console.error("Error fetching profile data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProfileData();
  }, []);

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

  const fullName = [profileData.first_name, profileData.last_name]
    .filter(Boolean)
    .join(" ");

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
          {profileData.avatar_url ? (
            <div className="flex-shrink-0">
              <img 
                src={profileData.avatar_url}
                alt="Profile avatar" 
                className="w-24 h-24 rounded-full object-cover border"
              />
            </div>
          ) : (
            <div className="flex-shrink-0 w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center">
              <User className="h-12 w-12 text-gray-400" />
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <h3 className="text-xl font-medium text-gray-900">
                {fullName || "No name provided"}
              </h3>
              <p className="text-muted-foreground">{profileData.email}</p>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-gray-500" />
                <span>
                  <span className="font-medium">Role:</span>{" "}
                  <span className={`${
                    profileData.role === 'administrator' ? 'text-blue-600' : 'text-gray-600'
                  } capitalize`}>
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
        </div>
      </CardContent>
    </Card>
  );
};

export default ProfileInformation;
