import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Loader2, Mail, Bell, Send } from "lucide-react";
import { toast } from "sonner";
import { getCurrentUser } from "@/services/supabaseHelpers";
import {
  NotificationPreference,
  getNotificationPreferencesByUserId,
  upsertNotificationPreferences,
  sendTestEmail as sendTestEmailRequest,
} from "@/services/notifications";

const NotificationPreferencesPage: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [sendingTest, setSendingTest] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);
  const [defaultEmail, setDefaultEmail] = useState<string>("");
  const [inApp, setInApp] = useState(true);
  const [emailEnabled, setEmailEnabled] = useState(true);
  const [emailAddress, setEmailAddress] = useState("");

  useEffect(() => {
    (async () => {
      const user = await getCurrentUser();
      if (!user) { navigate("/auth"); return; }
      setUserId(user.id);
      setDefaultEmail(user.email || "");

      let pref: NotificationPreference | null = null;
      try {
        pref = await getNotificationPreferencesByUserId(user.id);
      } catch {
        // Fall back to defaults when preferences can't be read.
      }

      if (pref) {
        setEmailEnabled(pref.email_enabled);
        setEmailAddress(pref.email_address || "");
        setInApp(pref.push_enabled || true); // reuse push_enabled as in-app proxy
      }
      setLoading(false);
    })();
  }, [navigate]);

  const save = async () => {
    if (!userId) return;
    if (emailAddress && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailAddress)) {
      toast.error("Please enter a valid email address");
      return;
    }
    setSaving(true);
    const payload = {
      user_id: userId,
      email_enabled: emailEnabled,
      push_enabled: inApp,
      email_address: emailAddress || null,
      updated_at: new Date().toISOString(),
    };
    try {
      await upsertNotificationPreferences(payload);
    } catch (error) {
      setSaving(false);
      toast.error("Failed to save: " + (error as Error).message);
      return;
    }
    setSaving(false);
    toast.success("Notification preferences saved");
  };

  const sendTestEmail = async () => {
    if (!userId) return;
    const to = (emailAddress || defaultEmail || "").trim();
    if (!to) {
      toast.error("No email address available");
      return;
    }
    setSendingTest(true);
    try {
      await sendTestEmailRequest(to, userId);
      toast.success(`Test email sent to ${to}`);
    } catch (e) {
      toast.error("Failed to send test email: " + ((e as Error)?.message || "Unknown error"));
    } finally {
      setSendingTest(false);
    }
  };

  return (
    <DashboardLayout>
      <Helmet><title>Notification Preferences | MaintenEase</title></Helmet>
      <div className="px-4 md:px-6 lg:px-8 py-6 max-w-2xl space-y-4">
        <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="-ml-2">
          <ArrowLeft className="h-4 w-4 mr-1" /> Back to Dashboard
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Notification Preferences</h1>
          <p className="text-sm text-muted-foreground">Choose how you want to be notified.</p>
        </div>

        {loading ? (
          <div className="flex justify-center py-12"><Loader2 className="h-6 w-6 animate-spin text-muted-foreground" /></div>
        ) : (
          <>
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Channels</CardTitle>
                <CardDescription>Pick which channels deliver your notifications.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-start gap-3">
                    <Bell className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">In-app notifications</p>
                      <p className="text-sm text-muted-foreground">Show notifications in the bell menu</p>
                    </div>
                  </div>
                  <Switch checked={inApp} onCheckedChange={setInApp} />
                </div>
                <div className="flex items-center justify-between p-3 border rounded-md">
                  <div className="flex items-start gap-3">
                    <Mail className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div>
                      <p className="font-medium">Email notifications</p>
                      <p className="text-sm text-muted-foreground">Send a copy to your inbox</p>
                    </div>
                  </div>
                  <Switch checked={emailEnabled} onCheckedChange={setEmailEnabled} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-base">Email address</CardTitle>
                <CardDescription>
                  Leave blank to use your account email ({defaultEmail || "—"}).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Label htmlFor="email">Override email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder={defaultEmail}
                    value={emailAddress}
                    onChange={(e) => setEmailAddress(e.target.value)}
                    disabled={!emailEnabled}
                  />
                </div>
              </CardContent>
            </Card>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => navigate("/notifications/email-log")}>
                View email log
              </Button>
              <Button variant="outline" onClick={sendTestEmail} disabled={sendingTest || !emailEnabled}>
                {sendingTest ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Send className="h-4 w-4 mr-1" />}
                Send test email
              </Button>
              <Button onClick={save} disabled={saving}>
                {saving && <Loader2 className="h-4 w-4 mr-1 animate-spin" />}
                Save preferences
              </Button>
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default NotificationPreferencesPage;
