import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Settings as SettingsIcon, User, Bell, Shield, Palette, Send, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import PageContainer from "@/components/shell/PageContainer";
import BackToDashboard from "@/components/dashboard/BackToDashboard";
import ProfileInformation from "@/components/profile/ProfileInformation";
import WeatherAlertsCard from "@/components/dashboard/tabs/settings/WeatherAlertsCard";
import NotificationPreferences from "@/components/dashboard/tabs/settings/NotificationPreferences";
import DisplaySettings from "@/components/dashboard/tabs/settings/DisplaySettings";
import { useSettingsState } from "@/components/dashboard/tabs/settings/hooks/useSettingsState";
import { toast } from "sonner";
import { getCurrentUser } from "@/services/supabaseHelpers";
import {
  getNotificationPreferencesByUserId,
  sendTestEmail as sendTestEmailRequest,
  sendSmsNotification,
} from "@/services/notifications";

const Settings = () => {
  const {
    notificationPreferences,
    displaySettings,
    dashboardLayout,
    handleNotificationToggle,
    handleDisplaySettingToggle,
    handleLayoutChange,
  } = useSettingsState();

  const [sendingTest, setSendingTest] = useState(false);
  const [sendingTestSms, setSendingTestSms] = useState(false);

  const emailNotificationsEnabled =
    notificationPreferences.find((p) => p.id === 1)?.enabled ?? true;

  const sendTestEmail = async () => {
    setSendingTest(true);
    try {
      const user = await getCurrentUser();
      if (!user?.email) {
        toast.error("No email on your account");
        return;
      }
      await sendTestEmailRequest(user.email, user.id);
      toast.success(`Test email sent to ${user.email}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      toast.error("Failed to send test email: " + message);
    } finally {
      setSendingTest(false);
    }
  };

  const sendTestSms = async () => {
    setSendingTestSms(true);
    try {
      const user = await getCurrentUser();
      if (!user) {
        toast.error("Not signed in");
        return;
      }
      const prefs = await getNotificationPreferencesByUserId(user.id);
      const phone = prefs?.phone_number;
      if (!phone) {
        toast.error("Add a phone number under notification preferences first");
        return;
      }
      await sendSmsNotification(
        phone,
        "MaintenEase test SMS ✅ Texting is working.",
        user.id,
      );
      toast.success(`Test SMS sent to ${phone}`);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : "Unknown error";
      toast.error("Failed to send test SMS: " + message);
    } finally {
      setSendingTestSms(false);
    }
  };

  return (
    <DashboardLayout>
      <PageContainer className="space-y-8">
        <BackToDashboard />

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
          <div className="overflow-x-auto pb-1">
            <TabsList className="inline-flex h-auto gap-1 bg-card border border-border rounded-lg p-1 mb-8 min-w-[300px] shadow-sm">
              <TabsTrigger
                value="profile"
                className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-ui"
              >
                <User className="h-4 w-4" />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger
                value="notifications"
                className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-ui"
              >
                <Bell className="h-4 w-4" />
                <span className="hidden sm:inline">Notifications</span>
                <span className="sm:hidden">Alerts</span>
              </TabsTrigger>
              <TabsTrigger
                value="security"
                className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-ui"
              >
                <Shield className="h-4 w-4" />
                <span>Security</span>
              </TabsTrigger>
              <TabsTrigger
                value="appearance"
                className="flex items-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold text-muted-foreground data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-sm transition-ui"
              >
                <Palette className="h-4 w-4" />
                <span className="hidden sm:inline">Appearance</span>
                <span className="sm:hidden">Theme</span>
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="profile" className="mt-0">
            <ProfileInformation />
          </TabsContent>

          <TabsContent value="notifications" className="mt-0 space-y-6">
            <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/20 transition-ui">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="font-headline text-xl text-foreground">
                  Notification Preferences
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Changes save automatically. Use email delivery settings for custom addresses and
                  opt-in details.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-6">
                <NotificationPreferences
                  preferences={notificationPreferences}
                  onToggle={handleNotificationToggle}
                />

                <div className="flex flex-wrap gap-3 pt-4 border-t border-border">
                  <Button variant="outline" asChild className="border-border text-primary hover:bg-primary/5">
                    <Link to="/settings/notifications">Email &amp; delivery settings</Link>
                  </Button>
                  <Button
                    variant="outline"
                    onClick={sendTestEmail}
                    disabled={sendingTest || !emailNotificationsEnabled}
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

          <TabsContent value="security" className="mt-0">
            <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/20 transition-ui">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="font-headline text-xl text-foreground">
                  Security Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Manage your account security and privacy settings.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 rounded-lg bg-background border border-border">
                  <div className="space-y-0.5">
                    <p className="text-sm font-semibold text-foreground">Password</p>
                    <p className="text-sm text-muted-foreground">
                      Reset your password via the secure email link flow.
                    </p>
                  </div>
                  <Button variant="outline" asChild className="border-border text-primary hover:bg-primary/5 shrink-0">
                    <Link to="/forgot-password">Reset password</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="mt-0">
            <Card className="bg-card border border-border rounded-lg shadow-sm hover:shadow-md hover:border-primary/20 transition-ui">
              <CardHeader className="border-b border-border pb-4">
                <CardTitle className="font-headline text-xl text-foreground">
                  Appearance Settings
                </CardTitle>
                <CardDescription className="text-muted-foreground">
                  Theme and layout preferences save automatically when you change them.
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-6">
                <DisplaySettings
                  settings={displaySettings}
                  dashboardLayout={dashboardLayout}
                  onToggle={handleDisplaySettingToggle}
                  onLayoutChange={handleLayoutChange}
                />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </PageContainer>
    </DashboardLayout>
  );
};

export default Settings;
