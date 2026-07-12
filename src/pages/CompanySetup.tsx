import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";
import { Loader2, AlertCircle, Building2, CheckCircle2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { createCompany, fetchUserCompany, updateCompany } from "@/services/company";
import { getBrowserTimezone, TIMEZONE_OPTIONS } from "@/constants/timezones";

interface CompanyFormData {
 name: string;
 industry: string;
 address: string;
 city: string;
 state: string;
 zipCode: string;
 phone: string;
 email: string;
 website: string;
 timezone: string;
}

const CompanySetup: React.FC = () => {
 const navigate = useNavigate();
 const { user, isAuthenticated, isLoading } = useAuth();
 const [formData, setFormData] = useState<CompanyFormData>({
 name: "",
 industry: "",
 address: "",
 city: "",
 state: "",
 zipCode: "",
 phone: "",
 email: "",
 website: "",
 timezone: getBrowserTimezone(),
 });
 const [isSubmitting, setIsSubmitting] = useState(false);
 const [error, setError] = useState<string | null>(null);
 const [existingCompanyId, setExistingCompanyId] = useState<string | null>(null);
  const initializedForUserRef = useRef<string | null>(null);

 // Check if user is authenticated and if they already have a company
 useEffect(() => {
 const checkCompanyAssociation = async () => {
 if (!isAuthenticated || !user) {
 navigate("/auth");
 return;
 }

  if (initializedForUserRef.current === user.id) {
    return;
  }

 try {
 const companyData = await fetchUserCompany();
 if (companyData?.id) {
 setExistingCompanyId(companyData.id);
 // Fill form with existing data
 setFormData({
 name: companyData.name || "",
 industry: companyData.industry || "",
 address: companyData.address || "",
 city: companyData.city || "",
 state: companyData.state || "",
 zipCode: companyData.zip_code || "",
 phone: companyData.phone || "",
  email: companyData.email || "",
 website: companyData.website || "",
 timezone: companyData.timezone || getBrowserTimezone(),
 });
 }

  initializedForUserRef.current = user.id;
 } catch (err) {
 console.error("Error checking company association:", err);
 }
 };

 checkCompanyAssociation();
 }, [navigate, isAuthenticated, user]);

 const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
 const { name, value } = e.target;
 setFormData(prev => ({ ...prev, [name]: value }));
 };

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 setError(null);
 setIsSubmitting(true);

 try {
 if (!user?.id) {
 throw new Error("User not authenticated");
 }

 if (!formData.name) {
 throw new Error("Company name is required");
 }

 // Create or update company
 let companyId = existingCompanyId;
 const companyInfo = {
 companyName: formData.name,
 industry: formData.industry || null,
 address: formData.address || null,
 city: formData.city || null,
 state: formData.state || null,
 zipCode: formData.zipCode || null,
 phone: formData.phone || null,
 email: formData.email || null,
 website: formData.website || null,
 timezone: formData.timezone,
 };

 if (companyId) {
 await updateCompany(companyId, companyInfo);
 
 toast.success("Company information updated successfully");
 } else {
 const companyData = await createCompany(companyInfo);
 companyId = companyData.id ?? null;
 if (!companyId) throw new Error("Company creation did not return an id");
 
 toast.success("Company created successfully");
 localStorage.setItem('maintenease_setup_complete', 'true');
 }

 // Redirect to dashboard or team setup
 setTimeout(() => {
 navigate("/team-setup");
 }, 1000);
 } catch (err: unknown) {
 console.error("Error saving company:", err);
 setError(err instanceof Error ? err.message : "Failed to save company information");
 toast.error("Failed to save company information");
 } finally {
 setIsSubmitting(false);
 }
 };

 if (isLoading) {
 return (
 <div className="flex items-center justify-center min-h-screen bg-background">
 <div className="text-center">
 <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
 <p className="mt-4 text-muted-foreground text-sm">Loading...</p>
 </div>
 </div>
 );
 }

 return (
 <div className="min-h-screen bg-background">
   {/* Top nav bar */}
   <nav className="fixed top-0 z-50 w-full h-16 bg-background/80 backdrop-blur-md border-b border-border flex items-center justify-between px-6">
     <div className="flex items-center gap-2">
       <Building2 className="h-5 w-5 text-primary" strokeWidth={1.5} />
       <span className="font-headline text-lg font-bold text-primary">MaintenEase</span>
       <span className="ml-2 px-2 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-semibold uppercase tracking-wide">
         Setup
       </span>
     </div>
     <div className="flex items-center gap-2 text-xs text-muted-foreground">
       <span>Step 1 of 4</span>
       <div className="w-28 h-1.5 bg-muted rounded-full overflow-hidden">
         <div className="w-1/4 h-full bg-primary rounded-full" />
       </div>
     </div>
   </nav>

   <main className="pt-28 pb-20 px-4 max-w-5xl mx-auto">
     {/* Stepper */}
     <div className="flex justify-between items-center relative max-w-2xl mx-auto mb-12">
       <div className="absolute top-5 left-0 w-full h-0.5 bg-border -z-10" />
       <div className="absolute top-5 left-0 w-1/4 h-0.5 bg-primary -z-10" />
       {["Organization", "Team", "Assets", "Review"].map((step, idx) => (
         <div key={step} className="flex flex-col items-center gap-2 bg-background px-3">
           <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm ring-4 ring-background ${
             idx === 0 ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
           }`}>
             {idx === 0 ? <CheckCircle2 className="h-5 w-5" /> : idx + 1}
           </div>
           <span className={`text-xs font-semibold ${idx === 0 ? "text-primary" : "text-muted-foreground"}`}>
             {step}
           </span>
         </div>
       ))}
     </div>

     {/* Page header */}
     <div className="text-center mb-10">
       <h1 className="font-headline text-2xl md:text-3xl font-bold text-primary mb-2">
         {existingCompanyId ? "Update Company Information" : "Organization Details"}
       </h1>
       <p className="text-muted-foreground max-w-md mx-auto text-sm">
         {existingCompanyId
           ? "Update your company's details to keep your profile current."
           : "Set up your company profile to customize your facility management experience."}
       </p>
     </div>

     <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
       {/* Main form card */}
       <section className="md:col-span-8 bg-card rounded-xl shadow-sm border border-border p-6 md:p-8">
         {error && (
           <Alert variant="destructive" className="mb-6">
             <AlertCircle className="h-4 w-4" />
             <AlertDescription>{error}</AlertDescription>
           </Alert>
         )}

         <form onSubmit={handleSubmit} className="space-y-6">
           <div>
             <Label htmlFor="name" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
               Company Name <span className="text-destructive">*</span>
             </Label>
             <Input
               id="name"
               name="name"
               value={formData.name}
               onChange={handleChange}
               placeholder="e.g. Acme Manufacturing Corp"
               required
               className="bg-muted border-transparent focus:border-primary focus:ring-primary focus:bg-background transition-ui"
             />
           </div>

           <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
             <div>
               <Label htmlFor="industry" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                 Industry
               </Label>
               <Input
                 id="industry"
                 name="industry"
                 value={formData.industry}
                 onChange={handleChange}
                 placeholder="Manufacturing, Healthcare, etc."
                 className="bg-muted border-transparent focus:border-primary focus:ring-primary focus:bg-background transition-ui"
               />
             </div>
             <div>
               <Label htmlFor="phone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                 Phone Number
               </Label>
               <Input
                 id="phone"
                 name="phone"
                 type="tel"
                 value={formData.phone}
                 onChange={handleChange}
                 placeholder="(555) 123-4567"
                 className="bg-muted border-transparent focus:border-primary focus:ring-primary focus:bg-background transition-ui"
               />
             </div>
           </div>

           <div>
             <Label htmlFor="timezone" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
               Facility Timezone
             </Label>
             <Select
               value={formData.timezone}
               onValueChange={(timezone) => setFormData((current) => ({ ...current, timezone }))}
             >
               <SelectTrigger id="timezone" className="bg-muted border-transparent focus:border-primary focus:ring-primary focus:bg-background">
                 <SelectValue placeholder="Select timezone" />
               </SelectTrigger>
               <SelectContent className="max-h-72">
                 {Array.from(new Set([formData.timezone, ...TIMEZONE_OPTIONS])).map((timezone) => (
                   <SelectItem key={timezone} value={timezone}>
                     {timezone.replace(/_/g, " ")}
                   </SelectItem>
                 ))}
               </SelectContent>
             </Select>
           </div>

           <div>
             <Label htmlFor="address" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
               Address
             </Label>
             <Textarea
               id="address"
               name="address"
               value={formData.address}
               onChange={handleChange}
               placeholder="123 Main Street"
               className="resize-none bg-muted border-transparent focus:border-primary focus:ring-primary focus:bg-background transition-ui"
             />
           </div>

           <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
             <div>
               <Label htmlFor="city" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">City</Label>
               <Input
                 id="city"
                 name="city"
                 value={formData.city}
                 onChange={handleChange}
                 placeholder="New York"
                 className="bg-muted border-transparent focus:border-primary focus:ring-primary focus:bg-background transition-ui"
               />
             </div>
             <div>
               <Label htmlFor="state" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">State</Label>
               <Input
                 id="state"
                 name="state"
                 value={formData.state}
                 onChange={handleChange}
                 placeholder="NY"
                 className="bg-muted border-transparent focus:border-primary focus:ring-primary focus:bg-background transition-ui"
               />
             </div>
             <div>
               <Label htmlFor="zipCode" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">ZIP Code</Label>
               <Input
                 id="zipCode"
                 name="zipCode"
                 value={formData.zipCode}
                 onChange={handleChange}
                 placeholder="10001"
                 className="bg-muted border-transparent focus:border-primary focus:ring-primary focus:bg-background transition-ui"
               />
             </div>
           </div>

           <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
             <div>
               <Label htmlFor="email" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                 Business Email
               </Label>
               <Input
                 id="email"
                 name="email"
                 type="email"
                 value={formData.email}
                 onChange={handleChange}
                 placeholder="contact@acme.com"
                 className="bg-muted border-transparent focus:border-primary focus:ring-primary focus:bg-background transition-ui"
               />
             </div>
             <div>
               <Label htmlFor="website" className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1.5 block">
                 Website
               </Label>
               <Input
                 id="website"
                 name="website"
                 value={formData.website}
                 onChange={handleChange}
                 placeholder="https://www.acme.com"
                 className="bg-muted border-transparent focus:border-primary focus:ring-primary focus:bg-background transition-ui"
               />
             </div>
           </div>

           <div className="flex justify-end gap-4 border-t border-border pt-6 mt-4">
             <Button
               type="button"
               variant="ghost"
               className="text-primary hover:bg-primary/5"
               onClick={() => navigate("/dashboard")}
             >
               Skip for now
             </Button>
             <Button
               type="submit"
               className="bg-primary text-primary-foreground hover:bg-primary-variant uppercase tracking-wide font-semibold shadow-md hover:-translate-y-0.5 transition-ui px-8"
               disabled={isSubmitting || !formData.name}
             >
               {isSubmitting ? (
                 <>
                   <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                   {existingCompanyId ? "Updating..." : "Saving..."}
                 </>
               ) : (
                 <>{existingCompanyId ? "Update Company" : "Next Step"}</>
               )}
             </Button>
           </div>
         </form>
       </section>

       {/* Sidebar info */}
       <aside className="md:col-span-4 space-y-4">
         <div className="bg-primary/5 rounded-xl p-5 border border-primary/20">
           <h3 className="text-sm font-semibold text-primary mb-2">Why this matters</h3>
           <p className="text-sm text-muted-foreground leading-relaxed">
             Industry and facility types help us pre-configure your asset libraries and
             compliance checklists. You can change these later in settings.
           </p>
         </div>

         <div className="bg-card rounded-xl p-5 border border-border shadow-sm">
           <h3 className="text-sm font-semibold text-foreground mb-3">Need help?</h3>
           <div className="space-y-2 text-sm text-muted-foreground">
             <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
               <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
               <span>Documentation</span>
             </div>
             <div className="flex items-center gap-2 hover:text-primary transition-colors cursor-pointer">
               <CheckCircle2 className="h-4 w-4 text-primary shrink-0" />
               <span>Talk to an Expert</span>
             </div>
           </div>
         </div>
       </aside>
     </div>
   </main>
 </div>
 );
};

export default CompanySetup;
