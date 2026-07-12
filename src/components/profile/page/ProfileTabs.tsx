
import React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { User, Settings } from "lucide-react";
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
 refreshKey,
}) => {
 return (
 <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
 <div className="overflow-x-auto pb-1">
 <TabsList className="inline-flex h-auto gap-1 bg-card border border-border rounded-lg p-1 mb-8 shadow-sm">
 <TabsTrigger
 value="profile"
 className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-ui"
 >
 <User className="h-4 w-4" />
 Profile
 </TabsTrigger>
 <TabsTrigger
 value="settings"
 className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-ui"
 >
 <Settings className="h-4 w-4" />
 Settings
 </TabsTrigger>
 </TabsList>
 </div>

 <TabsContent value="profile" className="mt-0">
 <ProfileTabContent refreshKey={refreshKey} />
 </TabsContent>

 <TabsContent value="settings" className="mt-0">
 <SettingsTab />
 </TabsContent>
 </Tabs>
 );
};
