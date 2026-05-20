import { useEffect, useState } from "react";
import { z } from "zod";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle2 } from "lucide-react";
import { getAttributionMetadata, trackMarketingEvent } from "@/lib/analytics/marketingEvents";

const leadSchema = z.object({
 name: z.string().trim().min(1, "Please enter your name").max(120),
 email: z.string().trim().email("Enter a valid work email").max(255),
 company: z.string().trim().max(160).optional().or(z.literal("")),
 phone: z.string().trim().max(40).optional().or(z.literal("")),
 message: z.string().trim().max(2000).optional().or(z.literal("")),
});

interface LeadCaptureFormProps {
 sourceSlug: string;
 title?: string;
 subtitle?: string;
 cta?: string;
}

const LeadCaptureForm = ({
 sourceSlug,
 title = "Talk to our team",
 subtitle = "Tell us about your asset register and we'll get back within one business day.",
 cta = "Request a walkthrough",
}: LeadCaptureFormProps) => {
 const { toast } = useToast();
 const [submitting, setSubmitting] = useState(false);
 const [submitted, setSubmitted] = useState(false);
 const [errors, setErrors] = useState<Record<string, string>>({});

 useEffect(() => {
 void trackMarketingEvent({
 eventType: "lead_form_view",
 pageSlug: sourceSlug,
 dedupeKey: `lead_form_view:${sourceSlug}`,
 });
 }, [sourceSlug]);

 const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
 e.preventDefault();
 setErrors({});
 const form = new FormData(e.currentTarget);
 const raw = {
 name: String(form.get("name") ?? ""),
 email: String(form.get("email") ?? ""),
 company: String(form.get("company") ?? ""),
 phone: String(form.get("phone") ?? ""),
 message: String(form.get("message") ?? ""),
 };
 const parsed = leadSchema.safeParse(raw);
 if (!parsed.success) {
 const fieldErrors: Record<string, string> = {};
 parsed.error.issues.forEach((issue) => {
 const key = String(issue.path[0] ?? "");
 if (key && !fieldErrors[key]) fieldErrors[key] = issue.message;
 });
 setErrors(fieldErrors);
 void trackMarketingEvent({
 eventType: "lead_form_validation_error",
 pageSlug: sourceSlug,
 metadata: { fields: Object.keys(fieldErrors), count: Object.keys(fieldErrors).length },
 });
 return;
 }
 setSubmitting(true);
 try {
 const { error } = await supabase.from("marketing_leads").insert({
 name: parsed.data.name,
 email: parsed.data.email,
 company: parsed.data.company || null,
 phone: parsed.data.phone || null,
 message: parsed.data.message || null,
 source_slug: sourceSlug,
 source_url: typeof window !== "undefined" ? window.location.href : null,
 });
 if (error) throw error;
 setSubmitted(true);
 void trackMarketingEvent({
 eventType: "lead_submit",
 pageSlug: sourceSlug,
 metadata: {
 has_phone: Boolean(parsed.data.phone),
 has_message: Boolean(parsed.data.message),
 ...getAttributionMetadata(),
 },
 });
 toast({ title: "Thanks — we'll be in touch.", description: "A MaintenEase specialist will reach out within one business day." });
 } catch (err) {
 toast({
 variant: "destructive",
 title: "Something went wrong",
 description: "Please try again or email hello@maintenease.com.",
 });
 } finally {
 setSubmitting(false);
 }
 };

 if (submitted) {
 return (
 <div className="p-8 rounded-2xl border border-border bg-card text-center">
 <CheckCircle2 className="h-10 w-10 text-maintenease-600 mx-auto mb-3" />
 <h3 className="text-2xl font-semibold text-foreground mb-2">Thanks — message received.</h3>
 <p className="text-foreground">A MaintenEase specialist will reach out within one business day.</p>
 </div>
 );
 }

 return (
 <form onSubmit={onSubmit} className="p-8 rounded-2xl border border-border bg-card">
 <h3 className="text-2xl font-semibold text-foreground mb-1">{title}</h3>
 <p className="text-foreground mb-6">{subtitle}</p>
 <div className="grid sm:grid-cols-2 gap-4">
 <div>
 <Label htmlFor="lead-name">Name</Label>
 <Input id="lead-name" name="name" autoComplete="name" required maxLength={120} />
 {errors.name && <p className="text-sm text-destructive mt-1">{errors.name}</p>}
 </div>
 <div>
 <Label htmlFor="lead-email">Work email</Label>
 <Input id="lead-email" name="email" type="email" autoComplete="email" required maxLength={255} />
 {errors.email && <p className="text-sm text-destructive mt-1">{errors.email}</p>}
 </div>
 <div>
 <Label htmlFor="lead-company">Company</Label>
 <Input id="lead-company" name="company" autoComplete="organization" maxLength={160} />
 {errors.company && <p className="text-sm text-destructive mt-1">{errors.company}</p>}
 </div>
 <div>
 <Label htmlFor="lead-phone">Phone (optional)</Label>
 <Input id="lead-phone" name="phone" type="tel" autoComplete="tel" maxLength={40} />
 {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone}</p>}
 </div>
 <div className="sm:col-span-2">
 <Label htmlFor="lead-message">How many assets are you tracking? (optional)</Label>
 <Textarea id="lead-message" name="message" rows={3} maxLength={2000} placeholder="e.g. ~500 HVAC and electrical assets across 6 buildings" />
 {errors.message && <p className="text-sm text-destructive mt-1">{errors.message}</p>}
 </div>
 </div>
 <div className="mt-6 flex items-center gap-3">
 <Button type="submit" size="lg" disabled={submitting}>
 {submitting ? "Sending…" : cta}
 </Button>
 <p className="text-xs text-muted-foreground">No spam. We only use this to reply to you.</p>
 </div>
 </form>
 );
};

export default LeadCaptureForm;