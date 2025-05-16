
import React, { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createCompany } from "@/services/companyService";
import { supabase } from "@/integrations/supabase/client";

interface FormState {
  company: string;
  fullName: string;
  role: string;
  email: string;
  notifications: boolean;
}

const getInitialEmail = () => {
  // Try to get from localStorage or just empty
  return localStorage.getItem("pending_auth_email") || "";
};

const getInitialCompanyName = () => {
  // Try to get company name from localStorage or just empty
  return localStorage.getItem("pending_company_name") || "";
};

const OnboardingForm: React.FC = () => {
  const [state, setState] = useState<FormState>({
    company: getInitialCompanyName(),
    fullName: "",
    role: "",
    email: getInitialEmail(),
    notifications: true,
  });
  const [submitting, setSubmitting] = useState(false);
  const [isInvited, setIsInvited] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<any>(null);
  const navigate = useNavigate();

  // Check if the user was invited to a company
  useEffect(() => {
    const checkInvitation = async () => {
      if (!state.email) return;

      // Check for invitation by email
      const { data: invites, error } = await supabase
        .from("organization_invitations")
        .select("*")
        .eq("email", state.email)
        .eq("status", "pending");
      
      if (error) {
        console.error("Error checking invitations:", error);
        return;
      }
      
      if (invites && invites.length > 0) {
        setIsInvited(true);
        setInviteDetails(invites[0]);
      }
    };
    
    checkInvitation();
  }, [state.email]);

  // Populate user data from auth
  useEffect(() => {
    const getUserData = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user?.user_metadata) {
        const firstName = user.user_metadata.first_name || '';
        const lastName = user.user_metadata.last_name || '';
        const fullName = `${firstName} ${lastName}`.trim();
        
        if (fullName) {
          setState(prev => ({ ...prev, fullName }));
        }
      }
    };
    
    getUserData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, [e.target.name]: e.target.value });
  };

  const handleCheckbox = (v: boolean) => {
    setState({ ...state, notifications: v });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        toast.error("User not found. Please log in again.");
        navigate("/auth");
        return;
      }

      // Update user profile with name
      const names = state.fullName.split(' ');
      const firstName = names[0];
      const lastName = names.slice(1).join(' ');
      
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          role: isInvited ? inviteDetails.role : "administrator"
        })
        .eq("id", user.id);
        
      if (profileError) {
        throw profileError;
      }

      if (isInvited && inviteDetails) {
        // Add user to the invited company
        const { error: companyError } = await supabase
          .from("profiles")
          .update({ company_id: inviteDetails.organization_id })
          .eq("id", user.id);
          
        if (companyError) {
          throw companyError;
        }
        
        // Update invitation status
        const { error: inviteError } = await supabase
          .from("organization_invitations")
          .update({ 
            status: "accepted", 
            accepted_at: new Date().toISOString() 
          })
          .eq("id", inviteDetails.id);
          
        if (inviteError) {
          throw inviteError;
        }
        
        toast.success("You've joined the company!");
      } else if (state.company) {
        // Create a new company if user isn't invited
        await createCompany({
          companyName: state.company
        });
        
        toast.success("Company created successfully!");
      }

      // Mark onboarding as complete
      localStorage.setItem('maintenease_setup_complete', 'true');
      
      // Clean up localStorage
      localStorage.removeItem("pending_auth_email");
      localStorage.removeItem("pending_company_name");
      
      toast.success("Onboarding complete! Redirecting to dashboard...");
      setTimeout(() => {
        navigate("/dashboard");
      }, 1000);
    } catch (error: any) {
      console.error("Error during onboarding:", error);
      toast.error(error.message || "Failed to complete onboarding");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      <div>
        <label className="block">Full Name</label>
        <Input
          name="fullName"
          placeholder="Jane Doe"
          value={state.fullName}
          required
          onChange={handleChange}
        />
      </div>
      
      <div>
        <label className="block">Role/Title</label>
        <Input
          name="role"
          placeholder="Facilities Manager"
          value={state.role}
          required
          onChange={handleChange}
        />
      </div>

      {isInvited ? (
        <div className="p-4 bg-green-50 border border-green-200 rounded-md">
          <p className="text-green-700 font-medium">
            You've been invited to join a company!
          </p>
          <p className="text-sm text-green-600 mt-1">
            Complete the onboarding to join.
          </p>
        </div>
      ) : (
        <div>
          <label className="block">Company/Organization Name</label>
          <Input
            name="company"
            placeholder="Acme Corp"
            value={state.company}
            required
            onChange={handleChange}
          />
        </div>
      )}
      
      <div>
        <label className="block">Contact Email</label>
        <Input
          name="email"
          type="email"
          required
          value={state.email}
          onChange={handleChange}
          readOnly={!!state.email}
        />
      </div>
      
      <div className="flex items-center gap-3">
        <Checkbox
          checked={state.notifications}
          onCheckedChange={handleCheckbox}
          id="onboarding-notifications"
        />
        <label htmlFor="onboarding-notifications">Enable notifications about important updates</label>
      </div>
      
      <div>
        <Button className="w-full bg-maintenease-600 hover:bg-maintenease-700" type="submit" disabled={submitting}>
          {submitting ? "Submitting..." : "Finish Onboarding"}
        </Button>
      </div>
    </form>
  );
};

export default OnboardingForm;
