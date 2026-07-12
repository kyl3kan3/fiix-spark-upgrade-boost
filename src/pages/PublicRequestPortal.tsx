import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import { z } from "zod";
import { AlertTriangle, CheckCircle2, Wrench, ImagePlus, X } from "lucide-react";
import {
  authorizePublicRequest,
  getPublicCompanyBySlug,
  submitPublicRequest,
  uploadPublicRequestPhotos,
  type PublicPortalCompany,
} from "@/services/requestService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import TurnstileWidget from "@/components/auth/TurnstileWidget";

type Company = PublicPortalCompany;
type PendingPhoto = { id: string; file: File; previewUrl: string };

const schema = z.object({
 title: z.string().trim().min(1, "Please describe the issue").max(200),
 description: z.string().trim().max(5000).optional().default(""),
 location_text: z.string().trim().max(300).optional().default(""),
 contact_name: z.string().trim().max(120).optional().default(""),
 contact_email: z.string().trim().email("Enter a valid email").max(255).optional().or(z.literal("")),
 contact_phone: z.string().trim().max(40).optional().default(""),
});

const PublicRequestPortal = () => {
 const { slug = "" } = useParams();
 const [company, setCompany] = useState<Company | null>(null);
 const [loading, setLoading] = useState(true);
 const [type, setType] = useState<"standard" | "urgent">("standard");
 const [submitted, setSubmitted] = useState(false);
 const [submitting, setSubmitting] = useState(false);
  const [photos, setPhotos] = useState<PendingPhoto[]>([]);
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [turnstileKey, setTurnstileKey] = useState(0);
  const photosRef = useRef<PendingPhoto[]>([]);
 const [form, setForm] = useState({
 title: "", description: "", location_text: "",
 contact_name: "", contact_email: "", contact_phone: "",
 });

 useEffect(() => {
 (async () => {
 try {
 setCompany(await getPublicCompanyBySlug(slug));
 } catch {
 setCompany(null);
 }
 setLoading(false);
 })();
 }, [slug]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => () => {
    photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
  }, []);

  const addPhotos = (files: FileList | null) => {
    if (!files) return;
    const next: File[] = [];
    for (const f of Array.from(files)) {
      if (!f.type.startsWith("image/")) continue;
      if (f.size > 10 * 1024 * 1024) {
        toast.error(`${f.name} is too large (max 10 MB)`);
        continue;
      }
      next.push(f);
    }
    const available = Math.max(0, 6 - photos.length);
    const additions = next.slice(0, available).map((file) => ({
      id: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
    }));
    setPhotos((prev) => [...prev, ...additions]);
  };

  const removePhoto = (id: string) => {
    setPhotos((current) => {
      const removed = current.find((photo) => photo.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return current.filter((photo) => photo.id !== id);
    });
  };

  const clearPhotos = () => {
    photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setPhotos([]);
  };

 const onSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 if (!company) return;
 if (!turnstileToken) {
   toast.error("Please complete the verification");
   return;
 }
 const parsed = schema.safeParse(form);
 if (!parsed.success) {
 const first = Object.values(parsed.error.flatten().fieldErrors)[0]?.[0];
 toast.error(first ?? "Please check the form");
 return;
 }
 setSubmitting(true);

    try {
      const files = photos.map((photo) => photo.file);
      const authorization = await authorizePublicRequest(
        company.id,
        files,
        turnstileToken,
      );
      const uploadedPaths = await uploadPublicRequestPhotos(
        files,
        authorization.uploads,
      );

      await submitPublicRequest({
        authorizationId: authorization.authorizationId,
        type,
        title: parsed.data.title,
        description: parsed.data.description ?? "",
        location_text: parsed.data.location_text || null,
        contact_name: parsed.data.contact_name || null,
        contact_email: parsed.data.contact_email || null,
        contact_phone: parsed.data.contact_phone || null,
        photoPaths: uploadedPaths,
        user_agent: typeof navigator !== "undefined" ? navigator.userAgent.slice(0, 500) : null,
      });
    } catch (error) {
      setSubmitting(false);
      setTurnstileToken(null);
      setTurnstileKey((key) => key + 1);
      toast.error((error as Error).message || "Couldn't submit - please try again");
      return;
    }
    setSubmitting(false);
    setSubmitted(true);
    clearPhotos();
    setTurnstileToken(null);
  };

 if (loading) {
 return <div className="min-h-screen flex items-center justify-center text-muted-foreground">Loading…</div>;
 }

 if (!company) {
 return (
 <div className="min-h-screen flex items-center justify-center bg-muted px-4">
 <Helmet><title>Request portal not found</title><meta name="robots" content="noindex" /></Helmet>
 <div className="text-center max-w-md">
 <h1 className="text-2xl font-bold mb-2">Portal not found</h1>
 <p className="text-foreground mb-6">This request portal link is invalid or has been removed.</p>
 <Button asChild><Link to="/">Back to MaintenEase</Link></Button>
 </div>
 </div>
 );
 }

 const portalUrl = `https://maintenease.com/r/${company.public_slug}`;

 return (
 <div className="min-h-screen bg-muted">
 <Helmet>
 <title>{`Submit a maintenance request — ${company.name}`}</title>
 <meta name="description" content={`Report a maintenance issue to ${company.name}. Flag urgent problems for immediate attention.`} />
 <meta name="robots" content="noindex" />
 <link rel="canonical" href={portalUrl} />
 </Helmet>

 <header className="bg-card border-b border-border">
 <div className="container mx-auto px-4 py-5 flex items-center gap-3 max-w-3xl">
 {company.logo ? (
 <img src={company.logo} alt={`${company.name} logo`} className="h-10 w-10 rounded object-cover" />
 ) : (
 <div className="h-10 w-10 rounded bg-primary text-white flex items-center justify-center">
 <Wrench className="h-5 w-5" />
 </div>
 )}
 <div>
 <p className="text-xs uppercase tracking-wide text-muted-foreground">Maintenance requests</p>
 <h1 className="text-lg font-semibold text-foreground leading-tight">{company.name}</h1>
 </div>
 </div>
 </header>

 <main className="container mx-auto px-4 py-10 max-w-3xl">
 {submitted ? (
 <div className="bg-card rounded-xl border border-border p-10 text-center">
 <CheckCircle2 className="h-12 w-12 text-success mx-auto mb-4" />
 <h2 className="text-2xl font-bold mb-2">Thanks — the team has been notified</h2>
 <p className="text-foreground mb-6">
 {type === "urgent"
 ? "An urgent alert was sent to the on-call team. Someone will be in touch shortly."
 : "Your request is in the queue and will be reviewed shortly."}
 </p>
 <Button onClick={() => { setSubmitted(false); setForm({ title: "", description: "", location_text: "", contact_name: "", contact_email: "", contact_phone: "" }); setType("standard"); }} variant="outline">
 Submit another request
 </Button>
 </div>
 ) : (
 <>
 <div className="grid sm:grid-cols-2 gap-3 mb-8">
 <button
 type="button"
 onClick={() => setType("standard")}
 className={`p-5 rounded-lg border-2 text-left transition-ui ${type === "standard" ? "border-primary bg-primary/5" : "border-border bg-card hover:border-border"}`}
 >
 <div className="flex items-center gap-2 mb-1">
 <Wrench className="h-5 w-5 text-primary" />
 <span className="font-semibold">Submit a request</span>
 </div>
 <p className="text-sm text-foreground">Routine maintenance, repairs, or improvements.</p>
 </button>
 <button
 type="button"
 onClick={() => setType("urgent")}
 className={`p-5 rounded-lg border-2 text-left transition-ui ${type === "urgent" ? "border-destructive bg-destructive/10" : "border-border bg-card hover:border-destructive/30"}`}
 >
 <div className="flex items-center gap-2 mb-1">
 <AlertTriangle className="h-5 w-5 text-destructive" />
 <span className="font-semibold text-destructive">Urgent — needs fixing now</span>
 </div>
 <p className="text-sm text-foreground">Safety risk, leak, no heat/AC, power, equipment down.</p>
 </button>
 </div>

 <form onSubmit={onSubmit} className="bg-card rounded-xl border border-border p-6 sm:p-8 space-y-5">
 <div className="space-y-2">
 <Label htmlFor="title">What's the issue? *</Label>
 <Input id="title" required maxLength={200} value={form.title}
 onChange={(e) => setForm({ ...form, title: e.target.value })}
 placeholder="e.g. Leaking sink in 2nd floor break room" />
 </div>
 <div className="space-y-2">
 <Label htmlFor="description">More details</Label>
 <Textarea id="description" rows={4} maxLength={5000} value={form.description}
 onChange={(e) => setForm({ ...form, description: e.target.value })}
 placeholder="When did it start? What have you tried?" />
 </div>
 <div className="space-y-2">
 <Label htmlFor="location_text">Location</Label>
 <Input id="location_text" maxLength={300} value={form.location_text}
 onChange={(e) => setForm({ ...form, location_text: e.target.value })}
 placeholder="Building, floor, room…" />
 </div>
 <div className="grid sm:grid-cols-2 gap-4">
 <div className="space-y-2">
 <Label htmlFor="contact_name">Your name</Label>
 <Input id="contact_name" maxLength={120} value={form.contact_name}
 onChange={(e) => setForm({ ...form, contact_name: e.target.value })} />
 </div>
 <div className="space-y-2">
 <Label htmlFor="contact_phone">Phone</Label>
 <Input id="contact_phone" type="tel" maxLength={40} value={form.contact_phone}
 onChange={(e) => setForm({ ...form, contact_phone: e.target.value })} />
 </div>
 </div>
 <div className="space-y-2">
 <Label htmlFor="contact_email">Email (for updates)</Label>
 <Input id="contact_email" type="email" maxLength={255} value={form.contact_email}
 onChange={(e) => setForm({ ...form, contact_email: e.target.value })} />
 </div>

              <div className="space-y-2">
                <Label>Photos (optional)</Label>
                <div className="flex flex-wrap gap-3">
                  {photos.map((photo, i) => (
                    <div key={photo.id} className="relative h-20 w-20 rounded-md overflow-hidden border border-border bg-muted">
                      <img src={photo.previewUrl} alt={`Maintenance issue attachment ${i + 1}: ${photo.file.name}`} className="h-full w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removePhoto(photo.id)}
                        className="absolute top-0.5 right-0.5 bg-foreground/70 text-background rounded-full p-0.5"
                        aria-label="Remove photo"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </div>
                  ))}
                  {photos.length < 6 && (
                    <label className="h-20 w-20 rounded-md border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer text-muted-foreground hover:border-primary hover:text-foreground transition">
                      <ImagePlus className="h-5 w-5" />
                      <span className="text-[10px] mt-1">Add</span>
                      <input
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={(e) => { addPhotos(e.target.files); e.target.value = ""; }}
                      />
                    </label>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">Up to 6 images, 10 MB each. Helps the team diagnose faster.</p>
              </div>

             <div className="flex justify-center">
               <TurnstileWidget
                 key={turnstileKey}
                 onVerify={(t) => setTurnstileToken(t)}
                 onExpire={() => setTurnstileToken(null)}
               />
             </div>
 <Button type="submit" size="lg" disabled={submitting || !turnstileToken}
 className={type === "urgent" ? "w-full bg-destructive hover:bg-destructive" : "w-full"}>
 {submitting ? "Sending…" : type === "urgent" ? "Send urgent alert" : "Submit request"}
 </Button>
 <p className="text-xs text-muted-foreground text-center">
 Powered by <Link to="/" className="underline hover:text-foreground">MaintenEase</Link>
 </p>
 </form>
 </>
 )}
 </main>
 </div>
 );
};

export default PublicRequestPortal;
