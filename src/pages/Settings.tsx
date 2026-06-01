
import React, { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Loader2, Send } from "lucide-react";
import { useTheme } from "next-themes";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProfileInformation from "@/components/profile/ProfileInformation";
import WeatherAlertsCard from "@/components/dashboard/tabs/settings/WeatherAlertsCard";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import MaterialIcon from "@/components/ui/material-icon";
import { Helmet } from "react-helmet-async";

const Settings = () => {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [sendingTestSms, setSendingTestSms] = useState(false);
  const [activeSection, setActiveSection] = useState("company");
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
      <Helmet>
        <title>Settings | MaintenEase</title>
        <meta name="description" content="Manage your workspace preferences and organizational profile." />
        <link rel="canonical" href="https://maintenease.com/settings" />
      </Helmet>

      <main className="flex-1 p-gutter md:p-container_padding max-w-7xl mx-auto w-full">
        <div className="mb-8">
          <h1 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-2">Settings</h1>
          <p className="font-body-lg text-body-lg text-on-surface-variant">Manage your workspace preferences and organizational profile.</p>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Settings Navigation Sidebar */}
          <aside className="w-full lg:w-64 shrink-0">
            <nav className="space-y-1 bg-surface-container-lowest rounded-lg p-2 shadow-[0px_10px_30px_rgba(0,0,0,0.04)] border border-outline-variant/10">
              <button
                onClick={() => setActiveSection("account")}
                className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${activeSection === "account" ? "text-primary bg-primary/5 font-bold relative" : "text-on-surface-variant hover:bg-surface-container-low"}`}
              >
                {activeSection === "account" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md"></div>}
                <MaterialIcon name="person" className="mr-3" />
                <span className="font-label-md text-label-md">Account</span>
              </button>
              <button
                onClick={() => setActiveSection("company")}
                className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${activeSection === "company" ? "text-primary bg-primary/5 font-bold relative" : "text-on-surface-variant hover:bg-surface-container-low"}`}
              >
                {activeSection === "company" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md"></div>}
                <MaterialIcon name="domain" className="mr-3" filled={activeSection === "company"} />
                <span className="font-label-md text-label-md">Company Profile</span>
              </button>
              <button
                onClick={() => setActiveSection("notifications")}
                className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${activeSection === "notifications" ? "text-primary bg-primary/5 font-bold relative" : "text-on-surface-variant hover:bg-surface-container-low"}`}
              >
                {activeSection === "notifications" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md"></div>}
                <MaterialIcon name="notifications_active" className="mr-3" />
                <span className="font-label-md text-label-md">Notifications</span>
              </button>
              <button
                onClick={() => setActiveSection("security")}
                className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${activeSection === "security" ? "text-primary bg-primary/5 font-bold relative" : "text-on-surface-variant hover:bg-surface-container-low"}`}
              >
                {activeSection === "security" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md"></div>}
                <MaterialIcon name="security" className="mr-3" />
                <span className="font-label-md text-label-md">Security</span>
              </button>
              <button
                onClick={() => setActiveSection("integrations")}
                className={`w-full flex items-center px-4 py-3 rounded-md transition-colors ${activeSection === "integrations" ? "text-primary bg-primary/5 font-bold relative" : "text-on-surface-variant hover:bg-surface-container-low"}`}
              >
                {activeSection === "integrations" && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary rounded-l-md"></div>}
                <MaterialIcon name="api" className="mr-3" />
                <span className="font-label-md text-label-md">Integrations</span>
              </button>
            </nav>
          </aside>

          {/* Settings Content Area */}
          <div className="flex-1 space-y-8">
            {/* Account / Profile section */}
            {activeSection === "account" && (
              <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border border-outline-variant/10 hover:border-primary/20 transition-colors p-card_padding">
                <h2 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/20 pb-4 mb-6">Account</h2>
                <ProfileInformation />
              </div>
            )}

            {/* Company Profile section */}
            {activeSection === "company" && (
              <>
                <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border border-outline-variant/10 hover:border-primary/20 transition-colors p-card_padding">
                  <h2 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/20 pb-4 mb-6">Company Profile</h2>
                  <div className="flex flex-col md:flex-row gap-8 items-start mb-8">
                    <div className="shrink-0 flex flex-col items-center gap-4">
                      <div className="w-32 h-32 bg-surface-container-low rounded-lg border-2 border-dashed border-outline-variant flex items-center justify-center relative overflow-hidden group cursor-pointer">
                        <div className="flex flex-col items-center gap-2 text-on-surface-variant">
                          <MaterialIcon name="upload" />
                          <span className="font-label-sm text-label-sm uppercase">Upload Logo</span>
                        </div>
                      </div>
                      <button className="text-primary font-label-md text-label-md hover:underline decoration-2 underline-offset-4">Remove Logo</button>
                    </div>
                    <div className="flex-1 space-y-5 w-full">
                      <div>
                        <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Company Name</label>
                        <input className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" type="text" defaultValue="Acme Industrial Solutions" />
                      </div>
                      <div>
                        <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Industry</label>
                        <div className="relative">
                          <select className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none appearance-none transition-shadow">
                            <option>Manufacturing &amp; Facility Management</option>
                            <option>Energy &amp; Utilities</option>
                            <option>Logistics &amp; Warehousing</option>
                          </select>
                          <MaterialIcon name="expand_more" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border border-outline-variant/10 hover:border-primary/20 transition-colors p-card_padding">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Primary Contact Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Email Address</label>
                      <input className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" type="email" defaultValue="admin@acmeindustrial.com" />
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Phone Number</label>
                      <input className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" type="tel" defaultValue="+1 (555) 019-2834" />
                    </div>
                    <div className="md:col-span-2">
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Corporate Address</label>
                      <input className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none transition-shadow" type="text" defaultValue="4500 Industrial Pkwy, Tech District" />
                    </div>
                  </div>
                </div>

                {/* Localization */}
                <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border border-outline-variant/10 hover:border-primary/20 transition-colors p-card_padding">
                  <h3 className="font-headline-md text-headline-md text-on-surface mb-6">Localization</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Time Zone</label>
                      <div className="relative">
                        <select className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none appearance-none transition-shadow">
                          <option>(GMT-05:00) Eastern Time (US &amp; Canada)</option>
                          <option>(GMT-06:00) Central Time (US &amp; Canada)</option>
                          <option>(GMT-08:00) Pacific Time (US &amp; Canada)</option>
                        </select>
                        <MaterialIcon name="expand_more" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                      </div>
                    </div>
                    <div>
                      <label className="block font-label-md text-label-md text-on-surface-variant mb-1">Date Format</label>
                      <div className="relative">
                        <select className="w-full bg-surface-container-low border-none rounded-md px-4 py-2.5 font-body-md text-body-md text-on-surface focus:ring-2 focus:ring-primary focus:outline-none appearance-none transition-shadow">
                          <option>MM/DD/YYYY</option>
                          <option>DD/MM/YYYY</option>
                          <option>YYYY-MM-DD</option>
                        </select>
                        <MaterialIcon name="expand_more" className="absolute right-3 top-1/2 transform -translate-y-1/2 text-on-surface-variant pointer-events-none" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Footer */}
                <div className="flex justify-end gap-4 mt-8 border-t border-outline-variant/20 pt-6">
                  <button className="px-6 py-3 font-label-md text-label-md text-primary bg-transparent hover:bg-surface-container-low rounded uppercase transition-colors">Cancel</button>
                  <button className="px-6 py-3 font-label-md text-label-md text-on-primary bg-primary rounded uppercase shadow-md hover:bg-primary-container hover:shadow-lg transition-all transform active:scale-95">Save Changes</button>
                </div>
              </>
            )}

            {/* Notifications section */}
            {activeSection === "notifications" && (
              <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border border-outline-variant/10 hover:border-primary/20 transition-colors p-card_padding space-y-6">
                <h2 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/20 pb-4">Notification Preferences</h2>
                <div className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low/30">
                  <div className="space-y-0.5">
                    <Label htmlFor="emailNotifications" className="font-label-md text-label-md text-on-surface">Email Notifications</Label>
                    <p className="font-body-md text-body-md text-on-surface-variant">Receive updates via email</p>
                  </div>
                  <Switch id="emailNotifications" checked={emailNotifications} onCheckedChange={setEmailNotifications} />
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low/30">
                  <div className="space-y-0.5">
                    <Label htmlFor="pushNotifications" className="font-label-md text-label-md text-on-surface">Push Notifications</Label>
                    <p className="font-body-md text-body-md text-on-surface-variant">Receive browser notifications</p>
                  </div>
                  <Switch id="pushNotifications" checked={pushNotifications} onCheckedChange={setPushNotifications} />
                </div>
                <div className="flex flex-wrap gap-3 pt-4 border-t border-outline-variant/20">
                  <button className="px-6 py-3 font-label-md text-label-md text-on-primary bg-primary rounded uppercase shadow-md hover:bg-primary-container transition-all">Save Preferences</button>
                  <Button variant="outline" onClick={sendTestEmail} disabled={sendingTest || !emailNotifications} className="border-outline-variant text-primary hover:bg-primary/5">
                    {sendingTest ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                    Send test email
                  </Button>
                  <Button variant="outline" onClick={sendTestSms} disabled={sendingTestSms} className="border-outline-variant text-primary hover:bg-primary/5">
                    {sendingTestSms ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                    Send test SMS
                  </Button>
                </div>
                <WeatherAlertsCard />
              </div>
            )}

            {/* Security section */}
            {activeSection === "security" && (
              <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border border-outline-variant/10 hover:border-primary/20 transition-colors p-card_padding space-y-6">
                <h2 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/20 pb-4">Security Settings</h2>
                <div className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low/30">
                  <div className="space-y-0.5">
                    <p className="font-label-md text-label-md text-on-surface">Password</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">Update your account password</p>
                  </div>
                  <button className="px-6 py-3 font-label-md text-label-md text-on-primary bg-primary rounded uppercase shadow-md hover:bg-primary-container transition-all">Update Password</button>
                </div>
                <div className="flex items-center justify-between p-4 rounded-lg bg-surface-container-low/30">
                  <div className="space-y-0.5">
                    <p className="font-label-md text-label-md text-on-surface">Dark Mode</p>
                    <p className="font-body-md text-body-md text-on-surface-variant">Switch to dark theme</p>
                  </div>
                  <Switch id="darkMode" checked={theme === "dark"} onCheckedChange={handleDarkModeToggle} />
                </div>
              </div>
            )}

            {/* Integrations section */}
            {activeSection === "integrations" && (
              <div className="bg-surface-container-lowest rounded-xl shadow-[0px_10px_30px_rgba(0,0,0,0.04),0px_4px_8px_rgba(0,0,0,0.02)] border border-outline-variant/10 hover:border-primary/20 transition-colors p-card_padding">
                <h2 className="font-headline-md text-headline-md text-on-surface border-b border-outline-variant/20 pb-4 mb-6">Integrations</h2>
                <p className="font-body-md text-body-md text-on-surface-variant">Manage API keys and third-party integrations from the <a href="/api-keys" className="text-primary hover:underline">API &amp; Integrations</a> page.</p>
              </div>
            )}
          </div>
        </div>
      </main>
    </DashboardLayout>
  );
};

export default Settings;
