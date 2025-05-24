
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/auth";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export function useTeamSetupAuth() {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [companyName, setCompanyName] = useState("");

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

  return {
    isLoading,
    isAdmin,
    companyName
  };
}
