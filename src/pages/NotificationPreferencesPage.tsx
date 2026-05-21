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
import { supabase } from "@/integrations/supabase/client";

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
 const { data: { user } } = await supabase.auth.getUser();
 if (!user) { navigate("/auth"); return; }
 setUserId(user.id);
 setDefaultEmail(user.email || "");

 const { data: pref } = await supabase
 .from("notification_preferences")
 .select("*")
 .eq("user_id", user.id)
 .maybeSingle();

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
 const { error } = await supabase
 .from("notification_preferences")
 .upsert(payload, { onConflict: "user_id" });
 setSaving(false);
 if (error) { toast.error("Failed to save: " + error.message); return; }
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
 const { data, error } = await supabase.functions.invoke("send-email", {
 body: {
 to,
 subject: "MaintenEase test email",
 body: `<div style="font-family:Arial,sans-serif;padding:24px;color:#111">
 <h2 style="margin:0 0 12px">Resend is working ✅</h2>
 <p>This is a test email from MaintenEase confirming end-to-end delivery.</p>
 <p style="color:#666;font-size:12px;margin-top:24px">Sent to ${to}</p>
 </div>`,
 userId,
 notificationType: "test",
 },
 });
 if (error) throw error;
 if (data && (data as any).success === false) {
 throw new Error((data as any).error || "Unknown error");
 }
 toast.success(`Test email sent to ${to}`);
 } catch (e: any) {
 toast.error("Failed to send test email: " + (e?.message || "Unknown error"));
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