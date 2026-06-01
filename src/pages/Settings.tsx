
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTheme } from "next-themes";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageContainer from "@/components/shell/PageContainer";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import ProfileInformation from "@/components/profile/ProfileInformation";
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
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
  };

  const sendTestEmail = async () => {
    setSendingTest(true);
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();
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
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not signed in");
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("phone_number")
        .eq("id", user.id)
        .maybeSingle();
      const { data: prefs } = await supabase
        .from("notification_preferences")
        .select("phone_number")
        .eq("user_id", user.id)
        .maybeSingle();
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
      <PageContainer className="space-y-8">
        <BackToDashboard />

        {/* Page Header */}
        <div>
          <h1 className="font-headline text-3xl font-bold text-primary flex items-center gap-3">
            <SettingsIcon className="h-8 w-8" />
            Settings
          </h1>
          <p className="text-base text-muted-foreground mt-1">
            Manage your workspace preferences and organizational profile.
          </p>
        </div>

        <Tabs defaultValue="profile" className="w-full">
          {/* Tab List */}
          <div className="overflow-x-auto pb-1">
            <TabsList className="inline-flex h-auto gap-1 bg-card border border-border rounded-lg p-1 mb-8 min-w-[300px] shadow-sm">
              <TabsTrigger
                value="profile"
                className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Alerts</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-all"
              >
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Appearance</span>
                <span className="sm:hidden">Theme</span>
              </TabsTrigger>
            </TabsList>
          </div>

          {/* Profile Tab */}
          <TabsContent value="profile" className="mt-0">
            <ProfileInformation />
          </TabsContent>

          {/* Notifications Tab */}
          <TabsContent value="notifications" className="mt-0 space-y-6">
            <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="font-headline text-xl text-foreground">
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Control how and when you receive notifications.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-3">
                {/* Email Notifications Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-primary/20 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications" className="text-sm font-semibold text-foreground">
                      Email Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive updates via email</p>
                  </div>
                  <Switch
                    id="emailNotifications"
                    checked={emailNotifications}
                    onCheckedChange={setEmailNotifications}
                  />
                </div>

                {/* Push Notifications Toggle */}
                <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-primary/20 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushNotifications" className="text-sm font-semibold text-foreground">
                      Push Notifications
                    </Label>
                    <p className="text-sm text-muted-foreground">Receive browser notifications</p>
                  </div>
                  <Switch
                    id="pushNotifications"
                    checked={pushNotifications}
                    onCheckedChange={setPushNotifications}
                  />
                </div>

                <div className="flex flex-wrap gap-3 pt-4 border-t border-border mt-2">
                  <Button className="bg-primary hover:bg-primary-variant text-primary-foreground uppercase tracking-wide text-xs font-semibold">
                    Save Preferences
                  </Button>
                  <Button
                    variant="outline"
                    onClick={sendTestEmail}
                    disabled={sendingTest || !emailNotifications}
                    className="border-border text-primary hover:bg-primary/5"
                  >
                    {sendingTest ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    Send test email
                  </Button>
                  <Button
                    variant="outline"
                    onClick={sendTestSms}
                    disabled={sendingTestSms}
                    className="border-border text-primary hover:bg-primary/5"
                  >
                    {sendingTestSms ? (
                      <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    ) : (
                      <Send className="h-4 w-4 mr-1" />
                    )}
                    Send test SMS
                  </Button>
                </div>
              </CardContent>
            </Card>

            <WeatherAlertsCard />
          </TabsContent>

          {/* Security Tab */}
          <TabsContent value="security" className="mt-0">
            <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="font-headline text-xl text-foreground">
                  Security Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your account security and privacy settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-primary/20 transition-colors">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">Password</p>
                    <p className="text-sm text-muted-foreground">Update your account password</p>
                  </div>
                  <Button className="bg-primary hover:bg-primary-variant text-primary-foreground uppercase tracking-wide text-xs font-semibold">
                    Update Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Appearance Tab */}
          <TabsContent value="appearance" className="mt-0">
            <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/20 transition-all">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="font-headline text-xl text-foreground">
                  Appearance Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Customize the look and feel of your dashboard.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-background border border-border hover:border-primary/20 transition-colors">
                  <div className="space-y-0.5">
                    <Label htmlFor="darkMode" className="text-sm font-semibold text-foreground">
                      Dark Mode
                    </Label>
                    <p className="text-sm text-muted-foreground">Switch to dark theme</p>
                  </div>
                  <Switch
                    id="darkMode"
                    checked={theme === "dark"}
                    onCheckedChange={handleDarkModeToggle}
                  />
                </div>
                <div className="flex justify-end pt-2 border-t border-border">
                  <Button className="bg-primary hover:bg-primary-variant text-primary-foreground uppercase tracking-wide text-xs font-semibold">
                    Save Appearance
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContainer>
    </DashboardLayout>
  );
};

export default Settings;
