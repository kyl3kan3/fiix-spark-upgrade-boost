import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { createCompany } from "@/services/company";

interface FormState {
  company: string;
  fullName: string;
  role: string;
  email: string;
  notifications: boolean;
}

interface InviteDetails {
  id: string;
  organization_id: string;
  role: string;
  [key: string]: any;
}

export const useOnboarding = () => {
  const getInitialEmail = () => {
    return localStorage.getItem("pending_auth_email") || "";
  };

  const getInitialCompanyName = () => {
    return localStorage.getItem("pending_company_name") || "";
  };

  const [state, setState] = useState<FormState>({
    company: getInitialCompanyName(),
    fullName: "",
    role: "",
    email: getInitialEmail(),
    notifications: true,
  });

  const [submitting, setSubmitting] = useState(false);
  const [isInvited, setIsInvited] = useState(false);
  const [inviteDetails, setInviteDetails] = useState<InviteDetails | null>(null);
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
      console.log("Starting onboarding submission with state:", state);
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
      
      console.log("Updating user profile with name:", { firstName, lastName, role: state.role });
      
      const { error: profileError } = await supabase
        .from("profiles")
        .update({
          first_name: firstName,
          last_name: lastName,
          role: isInvited ? inviteDetails?.role : "administrator"
        })
        .eq("id", user.id);
        
      if (profileError) {
        console.error("Profile update error:", profileError);
        throw profileError;
      }

      if (isInvited && inviteDetails) {
        console.log("User was invited to company:", inviteDetails.organization_id);
        
        // Add user to the invited company
        const { error: companyError } = await supabase
          .from("profiles")
          .update({ company_id: inviteDetails.organization_id })
          .eq("id", user.id);
          
        if (companyError) {
          console.error("Error adding user to company:", companyError);
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
          console.error("Error updating invitation status:", inviteError);
          throw inviteError;
        }
        
        toast.success("You've joined the company!");
      } else if (state.company) {
        console.log("Creating new company:", state.company);
        try {
          await createCompany({
            companyName: state.company
          });
          
          toast.success("Company created successfully!");
        } catch (err: any) {
          console.error("Company creation error:", err);
          toast.error(err.message || "Failed to create company");
          setSubmitting(false);
          return;
        }
      }

      localStorage.setItem('maintenease_setup_complete', 'true');
      
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

  return {
    state,
    submitting,
    isInvited,
    inviteDetails,
    handleChange,
    handleCheckbox,
    handleSubmit
  };
};
