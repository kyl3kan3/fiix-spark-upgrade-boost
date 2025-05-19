
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const navigate = useNavigate();
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Prevent multiple redirects
    if (!isChecking) return;
    
    // Redirect to auth page always, unless user is logged in
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error("Error checking session:", error);
          setIsChecking(false);
          navigate("/auth", { replace: true });
          return;
        }
        
        if (data.session) {
          // Redirect logged in users to dashboard
          console.log("User is logged in, redirecting to dashboard");
          setIsChecking(false);
          navigate("/dashboard", { replace: true });
        } else {
          // Redirect non-logged in users to auth
          console.log("User is not logged in, redirecting to auth");
          setIsChecking(false);
          navigate("/auth", { replace: true });
        }
      } catch (err) {
        console.error("Exception during session check:", err);
        setIsChecking(false);
        navigate("/auth", { replace: true });
      }
    };
    
    checkSession();
  }, [navigate, isChecking]);

  // This component doesn't render anything as it's just a router
  return null;
};

export default Index;
