
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check authentication status and redirect accordingly
    const checkSession = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          navigate("/auth", { replace: true });
          return;
        }
        
        if (data.session) {
          // Check if user has a profile and company association
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', data.session.user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error("Error checking profile:", profileError);
          }
          
          // If user doesn't have a profile or company association, send to profile page
          if (!profileData) {
            navigate("/profile", { replace: true });
            return;
          }
          
          if (!profileData.company_id) {
            navigate("/profile", { replace: true });
            return;
          }
          
          // Redirect logged in users with complete profiles to dashboard
          navigate("/dashboard", { replace: true });
        } else {
          // Redirect non-logged in users to auth
          navigate("/auth", { replace: true });
        }
      } catch (err) {
        console.error("Unexpected error during session check:", err);
        navigate("/auth", { replace: true });
      } finally {
        setIsLoading(false);
      }
    };
    
    checkSession();
  }, [navigate]);

  // Show loading indicator while checking session
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // This component will not render anything since we always navigate away
  return null;
};

export default Index;
