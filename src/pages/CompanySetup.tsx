import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuth } from "@/hooks/auth";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

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

  // Check if user is authenticated and if they already have a company
  useEffect(() => {
    const checkCompanyAssociation = async () => {
      if (!isAuthenticated || !user) {
        navigate("/auth");
        return;
      }

      try {
        // Check if user has a profile with company association
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("company_id, email")
          .eq("id", user.id)
          .maybeSingle();

        if (profileError) {
          throw profileError;
        }

        if (profile?.company_id) {
          setExistingCompanyId(profile.company_id);
          
          // Load existing company data
          const { data: companyData, error: companyError } = await supabase
            .from("companies")
            .select("*")
            .eq("id", profile.company_id)
            .single();

          if (companyError) {
            console.error("Error fetching company:", companyError);
          } else if (companyData) {
            // Fill form with existing data
            setFormData({
              name: companyData.name || "",
              industry: companyData.industry || "",
              address: companyData.address || "",
              city: companyData.city || "",
              state: companyData.state || "",
              zipCode: companyData.zip_code || "",
              phone: companyData.phone || "",
              email: companyData.email || profile.email || "",
              website: companyData.website || "",
            });
          }
        } else if (user.email) {
          // Pre-fill email if available
          setFormData(prev => ({
            ...prev,
            email: user.email || ""
          }));
        }
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
      
      if (companyId) {
        // Update existing company
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
        // Create new company
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

        // Update user's profile with this company ID
        // (This will trigger the ensure_first_user_is_admin trigger we created)
        const { error: updateProfileError } = await supabase
          .from("profiles")
          .upsert({
            id: user.id,
            company_id: companyId,
            email: user.email || formData.email
          });

        if (updateProfileError) throw updateProfileError;
        
        toast.success("Company created successfully");
        localStorage.setItem('maintenease_setup_complete', 'true');
      }

      // Redirect to dashboard or team setup
      setTimeout(() => {
        navigate("/team-setup");
      }, 1000);
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
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-2xl">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">
            {existingCompanyId ? "Update Company Information" : "Create Your Company"}
          </CardTitle>
          <CardDescription>
            {existingCompanyId
              ? "Update your company's details"
              : "Get started by setting up your company information"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="name" className="text-base">Company Name*</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="Acme Inc."
                  required
                />
              </div>
              
              <div>
                <Label htmlFor="industry" className="text-base">Industry</Label>
                <Input
                  id="industry"
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  placeholder="Manufacturing, Healthcare, etc."
                />
              </div>
              
              <div>
                <Label htmlFor="address" className="text-base">Address</Label>
                <Textarea
                  id="address"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="123 Main Street"
                  className="resize-none"
                />
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div>
                  <Label htmlFor="city" className="text-base">City</Label>
                  <Input
                    id="city"
                    name="city"
                    value={formData.city}
                    onChange={handleChange}
                    placeholder="New York"
                  />
                </div>
                <div>
                  <Label htmlFor="state" className="text-base">State</Label>
                  <Input
                    id="state"
                    name="state"
                    value={formData.state}
                    onChange={handleChange}
                    placeholder="NY"
                  />
                </div>
                <div>
                  <Label htmlFor="zipCode" className="text-base">ZIP Code</Label>
                  <Input
                    id="zipCode"
                    name="zipCode"
                    value={formData.zipCode}
                    onChange={handleChange}
                    placeholder="10001"
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <div>
                  <Label htmlFor="phone" className="text-base">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="(555) 123-4567"
                  />
                </div>
                <div>
                  <Label htmlFor="email" className="text-base">Business Email</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="contact@acme.com"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="website" className="text-base">Website</Label>
                <Input
                  id="website"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://www.acme.com"
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !formData.name}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {existingCompanyId ? "Updating..." : "Creating Company..."}
                </>
              ) : (
                <>{existingCompanyId ? "Update Company" : "Create Company"}</>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default CompanySetup;
