
import React, { useState } from "react";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";

interface AdminFixerProps {
  onProfileFixed: () => void;
}

export const AdminFixer: React.FC<AdminFixerProps> = ({ onProfileFixed }) => {
  const [isFixing, setIsFixing] = useState(false);

  const handleFixProfile = async () => {
    try {
      toast.info("Attempting to fix your profile...");
      setIsFixing(true);
      
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast.error("Not authenticated. Please log in again.");
        setIsFixing(false);
        return;
      }
      
      // Check if there's a company that was created by this user
      const { data: company } = await supabase
        .from("companies")
        .select("id")
        .eq("created_by", user.id)
        .maybeSingle();
        
      if (!company) {
        toast.warning("No company found that was created by you. Please complete setup.");
        setIsFixing(false);
        return;
      }
      
      console.log("Found company created by user:", company);
      
      // Get email from user object
      const email = user.email || '';
      
      // Update profile with company ID and admin role
      const { error: updateError } = await supabase
        .from("profiles")
        .upsert({
          id: user.id,
          company_id: company.id,
          role: "administrator",
          email: email
        });
        
      if (updateError) {
        console.error("Error fixing profile:", updateError);
        toast.error("Failed to update profile. Please try setup again.");
        setIsFixing(false);
        return;
      }
      
      localStorage.setItem('maintenease_setup_complete', 'true');
      toast.success("Profile fixed successfully! You now have admin access.");
      
      // Force refresh after a short delay
      setTimeout(() => {
        onProfileFixed();
        setIsFixing(false);
      }, 1000);
      
    } catch (error) {
      console.error("Error fixing profile:", error);
      toast.error("Error occurred while fixing profile");
      setIsFixing(false);
    }
  };

  return (
    <Button 
      variant="secondary"
      onClick={handleFixProfile} 
      className="w-full"
      disabled={isFixing}
    >
      {isFixing ? (
        <>
          <Loader2 className="h-4 w-4 mr-2 animate-spin" />
          Fixing...
        </>
      ) : (
        <>
          Fix Admin Access
        </>
      )}
    </Button>
  );
};
