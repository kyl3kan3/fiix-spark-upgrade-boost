
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const Index = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Prevent multiple redirects
    if (!isChecking) return;
    
    // Redirect to auth page always, unless user is logged in
    const checkSession = async () => {
      try {
        setIsChecking(false); // Set this early to prevent multiple executions
        
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          // Clear any potentially corrupted auth data
          localStorage.removeItem('maintenease_setup_complete');
          localStorage.removeItem('maintenease_setup');
          navigate("/auth", { replace: true });
          return;
        }
        
        if (data.session) {
          // Redirect logged in users to dashboard
          console.log("User is logged in, redirecting to dashboard");
          navigate("/dashboard", { replace: true });
        } else {
          // Redirect non-logged in users to auth
          console.log("User is not logged in, redirecting to auth");
          navigate("/auth", { replace: true });
        }
      } catch (err) {
        console.error("Exception during session check:", err);
        // Clear any potentially corrupted data
        localStorage.removeItem('maintenease_setup_complete');
        localStorage.removeItem('maintenease_setup');
        navigate("/auth", { replace: true });
      }
    };
    
    checkSession();
  }, [navigate, isChecking]);

  // This component doesn't render anything as it's just a router
  return null;
};

export default Index;
