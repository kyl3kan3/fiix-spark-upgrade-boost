
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import ProfileInformation from "@/components/profile/ProfileInformation";
import SettingsTab from "@/components/dashboard/tabs/SettingsTab";
import WeatherAlertsCard from "@/components/dashboard/tabs/settings/WeatherAlertsCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Settings = () => {
 const [emailNotifications, setEmailNotifications] = useState(true);
 const [pushNotifications, setPushNotifications] = useState(false);
 const [sendingTest, setSendingTest] = useState(false);
 const [sendingTestSms, setSendingTestSms] = useState(false);
 const { theme, setTheme } = useTheme();

 const handleDarkModeToggle = () => {
 const newTheme = theme === 'dark' ? 'light' : 'dark';
 setTheme(newTheme);
 };

 const sendTestEmail = async () => {
 setSendingTest(true);
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user?.email) {
 toast.error("No email on your account");
 return;
 }
 const { error } = await supabase.functions.invoke("send-email", {
 body: {
 to: user.email,
 subject: "MaintenEase test email",
 notificationType: "test",
 userId: user.id,
 body: `<div style="font-family:system-ui,sans-serif;padding:24px">
 <h2>Resend is working ✅</h2>
 <p>This is a test email from MaintenEase confirming end-to-end delivery.</p>
 </div>`,
 },
 });
 if (error) throw error;
 toast.success(`Test email sent to ${user.email}`);
 } catch (e: any) {
 toast.error("Failed to send test email: " + (e?.message || "Unknown error"));
 } finally {
 setSendingTest(false);
 }
 };

 const sendTestSms = async () => {
 setSendingTestSms(true);
 try {
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) {
 toast.error("Not signed in");
 return;
 }
 const { data: profile } = await supabase
 .from("profiles").select("phone_number").eq("id", user.id).maybeSingle();
 const { data: prefs } = await supabase
 .from("notification_preferences").select("phone_number").eq("user_id", user.id).maybeSingle();
 const phone = (profile as any)?.phone_number || (prefs as any)?.phone_number;
 if (!phone) {
 toast.error("Add a phone number to your profile first");
 return;
 }
 const { error } = await supabase.functions.invoke("send-sms", {
 body: {
 to: phone,
 body: "MaintenEase test SMS ✅ Texting is working.",
 userId: user.id,
 notificationType: "test",
 },
 });
 if (error) throw error;
 toast.success(`Test SMS sent to ${phone}`);
 } catch (e: any) {
 toast.error("Failed to send test SMS: " + (e?.message || "Unknown error"));
 } finally {
 setSendingTestSms(false);
 }
 };

 return (
 <DashboardLayout>
 <div className="space-y-4 sm:space-y-6">
 <BackToDashboard />
 
 <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
 <div>
 <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-foreground flex items-center gap-2">
 <SettingsIcon className="h-6 w-6 sm:h-8 sm:w-8" />
 Settings
 </h1>
 <p className="text-sm sm:text-base text-foreground mt-1">Manage your account and application preferences</p>
 </div>
 </div>

 <Tabs defaultValue="profile" className="w-full">
 <div className="overflow-x-auto">
 <TabsList className="grid w-full grid-cols-2 sm:grid-cols-4 mb-4 sm:mb-6 min-w-[300px] bg-card border">
 <TabsTrigger value="profile" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2 data-[state=active]:bg-muted dark:data-[state=active]:bg-card text-foreground">
 <User className="h-3 w-3 sm:h-4 sm:w-4" />
 <span className="hidden sm:inline">Profile</span>
 <span className="sm:hidden">Profile</span>
 </TabsTrigger>
 <TabsTrigger value="notifications" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2 data-[state=active]:bg-muted dark:data-[state=active]:bg-card text-foreground">
 <Bell className="h-3 w-3 sm:h-4 sm:w-4" />
 <span className="hidden sm:inline">Notifications</span>
 <span className="sm:hidden">Alerts</span>
 </TabsTrigger>
 <TabsTrigger value="security" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2 data-[state=active]:bg-muted dark:data-[state=active]:bg-card text-foreground">
 <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
 <span className="hidden sm:inline">Security</span>
 <span className="sm:hidden">Security</span>
 </TabsTrigger>
 <TabsTrigger value="appearance" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2 data-[state=active]:bg-muted dark:data-[state=active]:bg-card text-foreground">
 <Palette className="h-3 w-3 sm:h-4 sm:w-4" />
 <span className="hidden sm:inline">Appearance</span>
 <span className="sm:hidden">Theme</span>
 </TabsTrigger>
 </TabsList>
 </div>
 
 <TabsContent value="profile" className="mt-0">
 <ProfileInformation />
 </TabsContent>
 
 <TabsContent value="notifications" className="mt-0">
 <Card className="border-border">
 <CardHeader>
 <CardTitle className="text-foreground">Notification Preferences</CardTitle>
 <CardDescription className="text-foreground">Control how and when you receive notifications.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center justify-between p-4 rounded-lg bg-muted border border-border">
 <div>
 <Label htmlFor="emailNotifications" className="text-foreground font-medium">Email Notifications</Label>
 <p className="text-sm text-foreground">Receive updates via email</p>
 </div>
 <Switch 
 id="emailNotifications"
 checked={emailNotifications}
 onCheckedChange={setEmailNotifications}
 />
 </div>
 <div className="flex items-center justify-between p-4 rounded-lg bg-muted border border-border">
 <div>
 <Label htmlFor="pushNotifications" className="text-foreground font-medium">Push Notifications</Label>
 <p className="text-sm text-foreground">Receive browser notifications</p>
 </div>
 <Switch 
 id="pushNotifications"
 checked={pushNotifications}
 onCheckedChange={setPushNotifications}
 />
 </div>
 <div className="flex flex-wrap gap-2">
 <Button className="bg-primary hover:bg-primary/90 text-white">Save Preferences</Button>
 <Button variant="outline" onClick={sendTestEmail} disabled={sendingTest || !emailNotifications}>
 {sendingTest ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
 Send test email
 </Button>
 <Button variant="outline" onClick={sendTestSms} disabled={sendingTestSms}>
 {sendingTestSms ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
 Send test SMS
 </Button>
 </div>
 </CardContent>
 </Card>
 <div className="mt-6">
 <WeatherAlertsCard />
 </div>
 </TabsContent>
 
 <TabsContent value="security" className="mt-0">
 <Card className="border-border">
 <CardHeader>
 <CardTitle className="text-foreground">Security Settings</CardTitle>
 <CardDescription className="text-foreground">Manage your account security and privacy settings.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <Button className="bg-primary hover:bg-primary/90 text-white">Update Password</Button>
 </CardContent>
 </Card>
 </TabsContent>
 
 <TabsContent value="appearance" className="mt-0">
 <Card className="border-border">
 <CardHeader>
 <CardTitle className="text-foreground">Appearance Settings</CardTitle>
 <CardDescription className="text-foreground">Customize the look and feel of your dashboard.</CardDescription>
 </CardHeader>
 <CardContent className="space-y-4">
 <div className="flex items-center justify-between p-4 rounded-lg bg-muted border border-border">
 <div>
 <Label htmlFor="darkMode" className="text-foreground font-medium">Dark Mode</Label>
 <p className="text-sm text-foreground">Switch to dark theme</p>
 </div>
 <Switch 
 id="darkMode"
 checked={theme === 'dark'}
 onCheckedChange={handleDarkModeToggle}
 />
 </div>
 <Button className="bg-primary hover:bg-primary/90 text-white">Save Appearance</Button>
 </CardContent>
 </Card>
 </TabsContent>
 </Tabs>
 </div>
 </DashboardLayout>
 );
};

export default Settings;
