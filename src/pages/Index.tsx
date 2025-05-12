
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Redirect to auth page always, unless user is logged in
    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        // Redirect logged in users to dashboard
        navigate("/dashboard");
      } else {
        // Redirect non-logged in users to auth
        navigate("/auth");
      }
    };
    
    checkSession();
  }, [navigate]);

  // This component doesn't render anything as it's just a router
  return null;
};

export default Index;
