
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const AdminSetDemoCompanyButton: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSetCompany = async () => {
    setLoading(true);
    try {
      // Get current admin user info
      const { data: { user }, error: meError } = await supabase.auth.getUser();
      if (meError || !user) {
        toast("Could not get your user info");
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
        toast("Your profile does not have a company name set.");
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
        toast("Could not find demo user");
        setLoading(false);
        return;
      }

      // Update demo user to use your company name
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ company_name: adminCompanyName })
        .eq("id", demoUser.id);

      if (updateError) {
        toast("Error updating company name for demo user");
      } else {
        toast(`Demo user is now attached to ${adminCompanyName}!`);
      }
    } catch (err) {
      console.error(err);
      toast("Unexpected error occurred");
    }
    setLoading(false);
  };

  return (
    <Button variant="outline" disabled={loading} onClick={handleSetCompany}>
      {loading
        ? "Updating demo user..."
        : "Attach demo@demo.com to MY company"}
    </Button>
  );
};

export default AdminSetDemoCompanyButton;

