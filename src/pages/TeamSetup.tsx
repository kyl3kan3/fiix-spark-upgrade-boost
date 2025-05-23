
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Users } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const TeamSetup: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [companyName, setCompanyName] = useState("");
  const [inviteEmail, setInviteEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const checkUserRole = async () => {
      if (!isAuthenticated || !user) {
        navigate("/auth");
        return;
      }

      try {
        // Check if user has admin role
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role, company_id")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (!profile.company_id) {
          // User doesn't have a company yet, redirect to company setup
          navigate("/company-setup");
          return;
        }

        setIsAdmin(profile.role === 'administrator');

        // Get company name
        const { data: company, error: companyError } = await supabase
          .from("companies")
          .select("name")
          .eq("id", profile.company_id)
          .single();

        if (companyError) throw companyError;
        
        setCompanyName(company.name);

      } catch (err) {
        console.error("Error checking user role:", err);
        toast.error("Error checking user permissions");
      }
    };

    checkUserRole();
  }, [navigate, isAuthenticated, user]);

  const handleInviteUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setError("Please enter a valid email address");
      return;
    }

    setIsSubmitting(true);

    try {
      if (!user?.id) {
        throw new Error("User not authenticated");
      }

      // Get user's company ID
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_id")
        .eq("id", user.id)
        .single();

      if (profileError) throw profileError;

      if (!profile.company_id) {
        throw new Error("No company associated with your account");
      }

      // Find organization record matching company_id
      const { data: organization, error: orgError } = await supabase
        .from("organizations")
        .select("id")
        .eq("id", profile.company_id)
        .maybeSingle();

      let organizationId = profile.company_id;
      
      // If no matching organization found, create one
      if (!organization && !orgError) {
        // Get company info to create organization
        const { data: company } = await supabase
          .from("companies")
          .select("name")
          .eq("id", profile.company_id)
          .single();
        
        // Create a new organization with the same ID as company
        const { data: newOrg, error: createOrgError } = await supabase
          .from("organizations")
          .insert({
            id: profile.company_id,
            name: company?.name || "Organization"
          })
          .select()
          .single();
          
        if (createOrgError) {
          console.error("Error creating organization:", createOrgError);
          throw new Error("Failed to create organization");
        }
        
        organizationId = newOrg.id;
      }

      // Create an invitation using the organization ID
      const { error: inviteError } = await supabase
        .from("organization_invitations")
        .insert({
          email: inviteEmail,
          organization_id: organizationId,
          invited_by: user.id,
          role: "technician", // Default role for new team members
          token: crypto.randomUUID(), // Generate a random token for the invite
        });

      if (inviteError) throw inviteError;

      toast.success(`Invitation sent to ${inviteEmail}`);
      setInviteEmail("");
    } catch (err: any) {
      console.error("Error inviting user:", err);
      setError(err.message || "Failed to send invitation");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSkip = () => {
    toast.info("You can invite team members later from the Team page");
    navigate("/dashboard");
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

  if (!isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle>Not Authorized</CardTitle>
            <CardDescription>
              You need administrator privileges to set up team members.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => navigate("/dashboard")} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto rounded-full bg-blue-100 p-3 mb-4">
            <Users className="h-8 w-8 text-blue-600" />
          </div>
          <CardTitle className="text-2xl">Invite Your Team</CardTitle>
          <CardDescription>
            {companyName ? `Add team members to ${companyName}` : "Invite colleagues to join your organization"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {error && (
            <Alert variant="destructive" className="mb-6">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleInviteUser} className="space-y-4">
            <div>
              <Label htmlFor="inviteEmail">Email Address</Label>
              <Input
                id="inviteEmail"
                type="email"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                placeholder="colleague@example.com"
                disabled={isSubmitting}
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !inviteEmail}
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending Invitation...
                </>
              ) : (
                "Send Invitation"
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <Button
              variant="outline"
              onClick={handleSkip}
              disabled={isSubmitting}
            >
              Skip for now
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TeamSetup;
