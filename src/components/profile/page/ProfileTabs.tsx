
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ProfileTabContent } from "./ProfileTabContent";
import SettingsTab from "@/components/dashboard/tabs/SettingsTab";

interface ProfileTabsProps {
  activeTab: string;
  onTabChange: (value: string) => void;
  refreshKey: number;
}

export const ProfileTabs: React.FC<ProfileTabsProps> = ({ 
  activeTab, 
  onTabChange,
  refreshKey
}) => {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="mt-4">
      <TabsList className="mb-6 bg-white/70 backdrop-blur-xl shadow-sm border">
        <TabsTrigger value="profile">Profile</TabsTrigger>
        <TabsTrigger value="settings">Settings</TabsTrigger>
      </TabsList>
      
      <TabsContent value="profile">
        <ProfileTabContent refreshKey={refreshKey} />
      </TabsContent>
      
      <TabsContent value="settings">
        <SettingsTab />
      </TabsContent>
    </Tabs>
  );
};
