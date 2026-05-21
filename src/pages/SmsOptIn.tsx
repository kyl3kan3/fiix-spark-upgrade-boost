import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { ArrowLeft, CheckCircle2, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export default function SmsOptIn() {
 const [phone, setPhone] = useState("");
 const [consent, setConsent] = useState(false);
 const [submitting, setSubmitting] = useState(false);
 const [done, setDone] = useState(false);

 const phoneValid = /^\+[1-9]\d{7,14}$/.test(phone.trim());

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!consent) {
 toast.error("Please check the consent box to opt in.");
 return;
 }
 if (!phoneValid) {
 toast.error("Enter a valid phone number in E.164 format (e.g. +15558675310).");
 return;
 }
 setSubmitting(true);
 const { error } = await supabase.from("sms_optins").insert({
 phone_number: phone.trim(),
 consent: true,
 source: "web_form",
 user_agent: navigator.userAgent,
 });
 setSubmitting(false);
 if (error) {
 toast.error("Could not save your opt-in. Please try again.");
 return;
 }
 setDone(true);
 };

 return (
 <div className="min-h-screen bg-background">
 <Helmet>
 <title>SMS Alerts Sign-Up | MaintenEase</title>
 <meta
 name="description"
 content="Opt in to receive SMS alerts from MaintenEase about work orders, inspections, and maintenance reminders. Message and data rates may apply."
 />
 <link rel="canonical" href="https://maintenease.com/sms-opt-in" />
 <meta property="og:title" content="SMS Alerts Sign-Up | MaintenEase" />
 <meta
 property="og:description"
 content="Opt in to MaintenEase SMS alerts for work orders, inspections, and maintenance reminders."
 />
 <meta property="og:url" content="https://maintenease.com/sms-opt-in" />
 <meta property="og:type" content="website" />
 <meta property="og:image" content="https://maintenease.com/og-image.png" />
 <meta name="twitter:card" content="summary_large_image" />
 <meta name="twitter:title" content="SMS Alerts Sign-Up | MaintenEase" />
 <meta
 name="twitter:description"
 content="Opt in to MaintenEase SMS alerts for work orders, inspections, and maintenance reminders."
 />
 <meta name="twitter:image" content="https://maintenease.com/og-image.png" />
 </Helmet>

 <div className="container mx-auto max-w-2xl px-4 py-12">
 <Button asChild variant="ghost" size="sm" className="mb-6">
 <Link to="/">
 <ArrowLeft className="mr-2 h-4 w-4" />
 Back to Home
 </Link>
 </Button>

 <h1 className="text-4xl font-bold tracking-tight mb-2">
 Sign Up for MaintenEase SMS Alerts
 </h1>
 <p className="text-muted-foreground mb-8">
 Get text messages from MaintenEase (Decent4) about your maintenance
 operations.
 </p>

 <div className="rounded-lg border bg-card p-6 md:p-8 shadow-sm">
 {done ? (
 <div className="flex flex-col items-center text-center py-8">
 <CheckCircle2 className="h-12 w-12 text-green-600 mb-3" />
 <h2 className="text-2xl font-semibold mb-2">You're signed up!</h2>
 <p className="text-muted-foreground">
 Thanks. You'll start receiving SMS alerts at {phone}. Reply{" "}
 <strong>STOP</strong> at any time to unsubscribe, or{" "}
 <strong>HELP</strong> for assistance.
 </p>
 </div>
 ) : (
 <form onSubmit={handleSubmit} className="space-y-6">
 <div>
 <label className="block text-sm font-medium mb-1" htmlFor="phone">
 Mobile phone number <span className="text-red-500">*</span>
 </label>
 <Input
 id="phone"
 name="phone"
 type="tel"
 placeholder="+15558675310"
 value={phone}
 onChange={(e) => setPhone(e.target.value)}
 required
 autoComplete="tel"
 />
 <p className="text-xs text-muted-foreground mt-1">
 Use E.164 format — start with + and country code.
 </p>
 </div>

 <div className="rounded-md bg-muted/40 border p-4 text-sm space-y-2">
 <p>
 <strong>What you'll receive:</strong> work-order assignments
 and status updates, inspection and checklist reminders,
 account and security alerts, and occasional service
 announcements from MaintenEase.
 </p>
 <p>
 <strong>Message frequency:</strong> recurring; varies based on
 your account activity (typically up to ~10 messages per
 week).
 </p>
 <p>
 <strong>Message & data rates may apply.</strong> Carriers are
 not liable for delayed or undelivered messages.
 </p>
 <p>
 Reply <strong>HELP</strong> for help or email support through
 the app. Reply <strong>STOP</strong> at any time to cancel.
 You can also unsubscribe from your{" "}
 <Link to="/settings/notifications" className="underline">
 notification preferences
 </Link>
 .
 </p>
 </div>

 <div className="flex items-start gap-3">
 <Checkbox
 id="sms-consent"
 checked={consent}
 onCheckedChange={(v) => setConsent(v === true)}
 />
 <label
 htmlFor="sms-consent"
 className="text-sm leading-relaxed cursor-pointer"
 >
 Yes, I agree to receive recurring automated SMS messages from
 MaintenEase (Decent4) at the phone number above. I understand
 that consent is not a condition of purchase, and that message
 and data rates may apply. I have read and agree to the{" "}
 <Link to="/terms" className="underline">
 Terms &amp; Conditions
 </Link>{" "}
 and{" "}
 <Link to="/privacy" className="underline">
 Privacy Notice
 </Link>
 .
 </label>
 </div>

 <Button
 type="submit"
 className="w-full"
 disabled={submitting || !consent || !phoneValid}
 >
 {submitting ? (
 <>
 <Loader2 className="mr-2 h-4 w-4 animate-spin" />
 Submitting...
 </>
 ) : (
 "Yes, sign me up!"
 )}
 </Button>
 </form>
 )}
 </div>
 </div>
 </div>
 );
}