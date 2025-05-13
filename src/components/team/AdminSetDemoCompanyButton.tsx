
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { useCurrentUserCompanyName } from "@/hooks/useCurrentUserCompanyName";

interface ProfileCompany {
  company_name: string;
}

const AdminSetDemoCompanyButton: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { companyName, loading: companyLoading } = useCurrentUserCompanyName();
  const { toast } = useToast();

  const handleSetCompany = async () => {
    setLoading(true);
    try {
      // Get current admin user info
      const { data: { user }, error: meError } = await supabase.auth.getUser();
      if (meError || !user) {
        toast({
          title: "Error",
          description: "Could not get your user info",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Fetch the company_name from your profile
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("company_name")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError || !profile?.company_name) {
        toast({
          title: "Profile incomplete",
          description: "Your profile does not have a company name set.",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      const adminCompanyName = profile.company_name;

      // Find the demo user profile
      const { data: demoUser, error: getError } = await supabase
        .from("profiles")
        .select("id, email, company_name")
        .eq("email", "demo@demo.com")
        .maybeSingle();

      if (getError || !demoUser) {
        toast({
          title: "Demo user missing",
          description: "Could not find demo user",
          variant: "destructive",
        });
        setLoading(false);
        return;
      }

      // Update demo user to use your company name
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ company_name: adminCompanyName })
        .eq("id", demoUser.id);

      if (updateError) {
        toast({
          title: "Update error",
          description: "Error updating company name for demo user",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Success",
          description: `Demo user is now attached to ${adminCompanyName}!`,
          variant: "default",
        });
      }
    } catch (err) {
      console.error(err);
      toast({
        title: "Unexpected error",
        description: "Unexpected error occurred",
        variant: "destructive",
      });
    }
    setLoading(false);
  };

  return (
    <Button
      variant="outline"
      disabled={loading || companyLoading || !companyName}
      onClick={handleSetCompany}
      aria-busy={loading || companyLoading}
    >
      {(loading || companyLoading) && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {companyName
        ? `Attach demo@demo.com to ${companyName}`
        : "Attach demo@demo.com to MY company"}
    </Button>
  );
};

export default AdminSetDemoCompanyButton;

