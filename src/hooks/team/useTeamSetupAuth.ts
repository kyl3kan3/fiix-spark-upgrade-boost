
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
        // Get the user's company from profiles (company_id only - role lives in user_roles)
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("company_id")
          .eq("id", user.id)
          .single();

        if (profileError) throw profileError;

        if (!profile.company_id) {
          // User doesn't have a company yet, redirect to company setup
          navigate("/company-setup");
          return;
        }

        // Check admin role from user_roles (source of truth)
        const { data: roleRow } = await supabase
          .from("user_roles")
          .select("role")
          .eq("user_id", user.id)
          .eq("role", "administrator")
          .maybeSingle();

        setIsAdmin(!!roleRow);

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
