
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth page always, unless user is logged in
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          navigate("/auth", { replace: true });
          return;
        }
        
        if (data.session) {
          // Redirect logged in users to dashboard
          navigate("/dashboard", { replace: true });
        } else {
          // Redirect non-logged in users to auth
          navigate("/auth", { replace: true });
        }
      } catch (err) {
        console.error("Exception during session check:", err);
        navigate("/auth", { replace: true });
      }
    };
    
    checkSession();
  }, [navigate]);

  // This component doesn't render anything as it's just a router
  return null;
};

export default Index;
