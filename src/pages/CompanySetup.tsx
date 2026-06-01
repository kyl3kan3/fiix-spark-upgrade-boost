import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";
import MaterialIcon from "@/components/ui/material-icon";

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
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [existingCompanyId, setExistingCompanyId] = useState<string | null>(null);
  const initializedForUserRef = useRef<string | null>(null);

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
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("company_id, email")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) throw profileError;

        if (profile?.company_id) {
          setExistingCompanyId(profile.company_id);

          const { data: companyData, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", profile.company_id)
            .single();

          if (companyError) {
            console.error("Error fetching company:", companyError);
          } else if (companyData) {
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
            });
          }
        }

        initializedForUserRef.current = user.id;
      } catch (err) {
        console.error("Error checking company association:", err);
      }
    };

    checkCompanyAssociation();
  }, [navigate, isAuthenticated, user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      if (!user?.id) throw new Error("User not authenticated");
      if (!formData.name) throw new Error("Company name is required");

      let companyId = existingCompanyId;

      if (companyId) {
        const { error: updateError } = await supabase
          .from("companies")
          .update({
            name: formData.name,
            industry: formData.industry || null,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            zip_code: formData.zipCode || null,
            phone: formData.phone || null,
            email: formData.email || null,
            website: formData.website || null,
            updated_at: new Date().toISOString()
          })
          .eq("id", companyId);

        if (updateError) throw updateError;
        toast.success("Company information updated successfully");
      } else {
        const { data: companyData, error: companyError } = await supabase
          .from("companies")
          .insert({
            name: formData.name,
            industry: formData.industry || null,
            address: formData.address || null,
            city: formData.city || null,
            state: formData.state || null,
            zip_code: formData.zipCode || null,
            phone: formData.phone || null,
            email: formData.email || null,
            website: formData.website || null,
            created_by: user.id
          })
          .select()
          .single();

        if (companyError) throw companyError;

        companyId = companyData.id;

        const { error: updateProfileError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            company_id: companyId,
            email: user.email || ""
          });

        if (updateProfileError) throw updateProfileError;

        toast.success("Company created successfully");
        localStorage.setItem('maintenease_setup_complete', 'true');
      }

      setTimeout(() => { navigate("/team-setup"); }, 1000);
    } catch (err: any) {
      console.error("Error saving company:", err);
      setError(err.message || "Failed to save company information");
      toast.error("Failed to save company information");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center">
          <MaterialIcon name="sync" className="animate-spin text-primary text-4xl" />
          <p className="mt-4 font-body-md text-on-surface-variant text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-background text-on-background min-h-screen font-body-md overflow-x-hidden">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 z-50 w-full h-16 bg-surface/80 backdrop-blur-md border-b border-outline-variant/30 flex justify-between items-center px-container_padding">
        <div className="flex items-center gap-2">
          <span className="font-headline-md text-headline-md font-bold text-primary">MaintenEase</span>
          <span className="px-2 py-0.5 rounded-full bg-primary-container text-on-primary-container font-label-sm text-[10px] uppercase tracking-wider">Setup</span>
        </div>
        <div className="flex items-center gap-4">
          <button
            className="font-label-md text-on-surface-variant hover:text-primary transition-colors"
            onClick={() => navigate("/dashboard")}
          >
            Save Draft
          </button>
          <div className="w-8 h-8 rounded-full bg-secondary-fixed flex items-center justify-center text-on-surface font-label-md">
            {user?.email?.substring(0, 2).toUpperCase() || "JD"}
          </div>
        </div>
      </nav>

      <main className="pt-32 pb-24 max-w-5xl mx-auto px-container_padding">
        {/* Stepper Header */}
        <header className="mb-16">
          <div className="flex justify-between items-center relative max-w-3xl mx-auto mb-4">
            {/* Stepper Progress Line Background */}
            <div className="absolute top-1/2 left-0 w-full h-[2px] bg-secondary-fixed -translate-y-1/2 -z-10"></div>
            {/* Active Progress Line */}
            <div className="absolute top-1/2 left-0 w-1/4 h-[2px] bg-primary-container -translate-y-1/2 -z-10"></div>
            {/* Step 1 */}
            <div className="flex flex-col items-center gap-2 bg-background px-4">
              <div className="w-10 h-10 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold ring-4 ring-background">1</div>
              <span className="font-label-md text-label-md text-primary">Organization</span>
            </div>
            {/* Step 2 */}
            <div className="flex flex-col items-center gap-2 bg-background px-4">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-surface-variant flex items-center justify-center font-bold ring-4 ring-background">2</div>
              <span className="font-label-md text-label-md text-on-surface-variant">Team</span>
            </div>
            {/* Step 3 */}
            <div className="flex flex-col items-center gap-2 bg-background px-4">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-surface-variant flex items-center justify-center font-bold ring-4 ring-background">3</div>
              <span className="font-label-md text-label-md text-on-surface-variant">Assets</span>
            </div>
            {/* Step 4 */}
            <div className="flex flex-col items-center gap-2 bg-background px-4">
              <div className="w-10 h-10 rounded-full bg-secondary-fixed text-on-surface-variant flex items-center justify-center font-bold ring-4 ring-background">4</div>
              <span className="font-label-md text-label-md text-on-surface-variant">Review</span>
            </div>
          </div>
          <div className="text-center mt-12">
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">
              {existingCompanyId ? "Update Company Information" : "Organization Details"}
            </h1>
            <p className="font-body-md text-on-surface-variant max-w-md mx-auto">
              {existingCompanyId
                ? "Update your company's details to keep your profile current."
                : "Set up your company profile to customize your facility management experience."}
            </p>
          </div>
        </header>

        {/* Form Canvas (Bento Layout) */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
          {/* Main Form Card */}
          <section className="md:col-span-8 bg-surface-container-lowest rounded-xl shadow-sm border border-outline-variant/10 p-card_padding">
            {error && (
              <div className="mb-6 p-4 bg-error-container text-on-error-container rounded-lg font-label-sm text-label-sm flex items-center gap-2">
                <MaterialIcon name="error" className="shrink-0" />
                {error}
              </div>
            )}
            <form className="space-y-8" onSubmit={handleSubmit}>
              {/* Company Name */}
              <div className="group">
                <label className="block font-label-md text-label-md text-on-surface mb-2 transition-colors group-focus-within:text-primary">
                  Company Name <span className="text-error">*</span>
                </label>
                <input
                  className="w-full h-12 px-4 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all font-body-md"
                  name="name"
                  placeholder="e.g. Acme Manufacturing Corp"
                  required
                  type="text"
                  value={formData.name}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Industry */}
                <div className="group">
                  <label className="block font-label-md text-label-md text-on-surface mb-2 transition-colors group-focus-within:text-primary">Industry</label>
                  <select
                    className="w-full h-12 px-4 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all font-body-md appearance-none"
                    name="industry"
                    value={formData.industry}
                    onChange={handleChange}
                  >
                    <option value="">Select Industry</option>
                    <option value="Manufacturing">Manufacturing</option>
                    <option value="Healthcare">Healthcare</option>
                    <option value="Logistics">Logistics</option>
                    <option value="Retail">Retail</option>
                    <option value="Education">Education</option>
                  </select>
                </div>
                {/* Phone */}
                <div className="group">
                  <label className="block font-label-md text-label-md text-on-surface mb-2 transition-colors group-focus-within:text-primary">Phone Number</label>
                  <input
                    className="w-full h-12 px-4 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all font-body-md"
                    name="phone"
                    placeholder="(555) 123-4567"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                  />
                </div>
              </div>
              {/* Address */}
              <div className="group">
                <label className="block font-label-md text-label-md text-on-surface mb-2">Address</label>
                <textarea
                  className="w-full px-4 py-3 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all font-body-md resize-none"
                  name="address"
                  placeholder="123 Main Street"
                  rows={2}
                  value={formData.address}
                  onChange={handleChange}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="group">
                  <label className="block font-label-md text-label-md text-on-surface mb-2">City</label>
                  <input
                    className="w-full h-12 px-4 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all font-body-md"
                    name="city"
                    placeholder="New York"
                    value={formData.city}
                    onChange={handleChange}
                  />
                </div>
                <div className="group">
                  <label className="block font-label-md text-label-md text-on-surface mb-2">State</label>
                  <input
                    className="w-full h-12 px-4 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all font-body-md"
                    name="state"
                    placeholder="NY"
                    value={formData.state}
                    onChange={handleChange}
                  />
                </div>
                <div className="group">
                  <label className="block font-label-md text-label-md text-on-surface mb-2">ZIP Code</label>
                  <input
                    className="w-full h-12 px-4 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all font-body-md"
                    name="zipCode"
                    placeholder="10001"
                    value={formData.zipCode}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="group">
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Business Email</label>
                  <input
                    className="w-full h-12 px-4 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all font-body-md"
                    name="email"
                    placeholder="contact@acme.com"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                  />
                </div>
                <div className="group">
                  <label className="block font-label-md text-label-md text-on-surface mb-2">Website</label>
                  <input
                    className="w-full h-12 px-4 rounded-lg bg-surface-container-low border-none focus:ring-2 focus:ring-primary transition-all font-body-md"
                    name="website"
                    placeholder="https://www.acme.com"
                    value={formData.website}
                    onChange={handleChange}
                  />
                </div>
              </div>
              <div className="mt-12 flex justify-end gap-4 border-t border-outline-variant/30 pt-8">
                <button
                  className="px-6 py-3 font-label-md text-label-md text-primary hover:underline transition-all"
                  type="button"
                  onClick={() => navigate("/dashboard")}
                >
                  Skip for now
                </button>
                <button
                  className="px-8 py-3 bg-primary text-on-primary rounded-lg font-label-md text-label-md uppercase tracking-wide shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                  disabled={isSubmitting || !formData.name}
                  type="submit"
                >
                  {isSubmitting ? (
                    <>
                      <MaterialIcon name="sync" className="animate-spin" />
                      {existingCompanyId ? "Updating..." : "Saving..."}
                    </>
                  ) : (
                    <>{existingCompanyId ? "Update Company" : "Next Step"}</>
                  )}
                </button>
              </div>
            </form>
          </section>

          {/* Sidebar Info/Tips */}
          <aside className="md:col-span-4 space-y-gutter">
            {/* Why this matters card */}
            <div className="bg-container-blue rounded-xl p-card_padding border border-primary-container/20">
              <div className="flex items-center gap-3 mb-4 text-primary">
                <MaterialIcon name="info" />
                <h3 className="font-label-md text-label-md">Why this matters</h3>
              </div>
              <p className="font-body-md text-body-md text-on-surface-variant leading-relaxed">
                Industry and facility types help us pre-configure your asset libraries and compliance checklists. You can change these later in settings.
              </p>
            </div>
            {/* Quick Help Card */}
            <div className="bg-surface-container-low rounded-xl p-card_padding border border-outline-variant/30">
              <h3 className="font-label-md text-label-md text-on-surface mb-3">Need help?</h3>
              <div className="flex flex-col gap-3">
                <a className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">
                  <MaterialIcon name="book" className="text-lg" />
                  Documentation
                </a>
                <a className="flex items-center gap-2 text-on-surface-variant hover:text-primary transition-colors text-sm" href="#">
                  <MaterialIcon name="chat" className="text-lg" />
                  Talk to an Expert
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-12 bg-on-background border-t border-outline/20 mt-auto">
        <div className="max-w-7xl mx-auto px-container_padding flex flex-col md:flex-row justify-between items-center gap-8">
          <span className="font-headline-md text-headline-md font-bold text-surface-bright">MaintenEase</span>
          <div className="flex gap-8">
            <a className="font-label-sm text-label-sm text-outline-variant hover:text-surface-bright transition-colors" href="#">Privacy Policy</a>
            <a className="font-label-sm text-label-sm text-outline-variant hover:text-surface-bright transition-colors" href="#">Compliance</a>
            <a className="font-label-sm text-label-sm text-outline-variant hover:text-surface-bright transition-colors" href="#">Support</a>
          </div>
          <p className="font-label-sm text-label-sm text-outline-variant">© 2024 MaintenEase CMMS. Precision Facility Management.</p>
        </div>
      </footer>
    </div>
  );
};

export default CompanySetup;
