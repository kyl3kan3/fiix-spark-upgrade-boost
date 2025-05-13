
import React, { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";

const AdminSetDemoCompanyButton: React.FC = () => {
  const [loading, setLoading] = useState(false);

  const handleSetCompany = async () => {
    setLoading(true);
    try {
      // Get demo user by email
      const { data: user, error: getError } = await supabase
        .from("profiles")
        .select("id, email, company_name")
        .eq("email", "demo@demo.com")
        .maybeSingle();

      if (getError || !user) {
        toast("Could not find demo user");
        setLoading(false);
        return;
      }

      // Update company_name
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ company_name: "Admiral Parkway" })
        .eq("id", user.id);

      if (updateError) {
        toast("Error updating company name");
      } else {
        toast("Demo user is now attached to Admiral Parkway!");
      }
    } catch (err) {
      console.error(err);
      toast("Unexpected error occurred");
    }
    setLoading(false);
  };

  return (
    <Button variant="outline" disabled={loading} onClick={handleSetCompany}>
      {loading ? "Updating..." : "Attach demo@demo.com to Admiral Parkway"}
    </Button>
  );
};

export default AdminSetDemoCompanyButton;
