
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export const useCurrentUserCompanyName = () => {
  const [companyName, setCompanyName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCompanyName = async () => {
      setLoading(true);
      const { data: { user }, error: meError } = await supabase.auth.getUser();
      if (meError || !user) {
        setCompanyName(null);
        setLoading(false);
        return;
      }
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_name")
        .eq("id", user.id)
        .maybeSingle();
      if (profileError || !profile?.company_name) {
        setCompanyName(null);
      } else {
        setCompanyName(profile.company_name);
      }
      setLoading(false);
    };
    fetchCompanyName();
  }, []);

  return { companyName, loading };
};
