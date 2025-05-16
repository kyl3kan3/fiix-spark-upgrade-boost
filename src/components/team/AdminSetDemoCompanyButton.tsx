
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { addUserToCompany } from "@/services/companyService";

// This component displays a button that administrators can use to set demo users
// to their company for testing and demonstration purposes
const AdminSetDemoCompanyButton: React.FC = () => {
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Check if the current user is an administrator
  React.useEffect(() => {
    const checkAdmin = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;
      
      const { data } = await supabase
        .from('profiles')
        .select('role, company_id')
        .eq('id', user.id)
        .single();
        
      if (data && data.role === 'administrator' && data.company_id) {
        setIsAdmin(true);
      }
    };
    
    checkAdmin();
  }, []);
  
  // If not an admin, don't render anything
  if (!isAdmin) return null;
  
  const handleSetDemoCompany = async () => {
    try {
      setIsLoading(true);
      
      // Get the current user's company ID
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast("Not logged in", {
          description: "Please log in to use this feature"
        });
        return;
      }
      
      const { data: currentUser } = await supabase
        .from('profiles')
        .select('company_id')
        .eq('id', user.id)
        .single();
        
      if (!currentUser?.company_id) {
        toast("No company found", {
          description: "You need to set up a company first"
        });
        return;
      }
      
      // Get all demo users (this is just an example, you'd need to define what a "demo user" is)
      const { data: demoUsers, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', 'demo@example.com');
        
      if (error) {
        console.error("Error fetching demo users:", error);
        throw new Error("Failed to find demo users");
      }
      
      // Update each demo user's company_id
      if (demoUsers && demoUsers.length > 0) {
        const updatePromises = demoUsers.map(demoUser => 
          addUserToCompany(demoUser.id, currentUser.company_id!)
        );
        
        await Promise.all(updatePromises);
        
        toast("Company Updated", {
          description: `${demoUsers.length} demo users have been added to your company.`
        });
      } else {
        toast("No demo users found to update");
      }
    } catch (error) {
      console.error("Error setting demo company:", error);
      toast.error("Failed to update demo users");
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Button 
      variant="outline" 
      size="sm" 
      onClick={handleSetDemoCompany}
      disabled={isLoading}
      className="mb-2"
    >
      {isLoading ? "Processing..." : "Set Demo Users to My Company"}
    </Button>
  );
};

export default AdminSetDemoCompanyButton;
