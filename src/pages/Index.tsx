
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

const Index = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showRetry, setShowRetry] = useState(false);

  const checkSession = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const { data, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error("Error checking session:", error);
        setError("Authentication error: " + error.message);
        navigate("/auth", { replace: true });
        return;
      }
      
      if (data.session) {
        try {
          // Check if user has a profile and company association
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('company_id')
            .eq('id', data.session.user.id)
            .maybeSingle();
            
          if (profileError) {
            console.error("Error checking profile:", profileError);
            setError("Error loading profile: " + profileError.message);
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
        } catch (err) {
          console.error("Error processing profile:", err);
          setError("Failed to process profile data");
          setShowRetry(true);
        }
      } else {
        // Redirect non-logged in users to auth
        navigate("/auth", { replace: true });
      }
    } catch (err) {
      console.error("Unexpected error during session check:", err);
      setError("Unexpected error occurred");
      navigate("/auth", { replace: true });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkSession();
    
    // Add a timeout for loading
    const timeoutId = setTimeout(() => {
      if (isLoading) {
        setIsLoading(false);
        setError("Loading took too long. Please try again.");
        setShowRetry(true);
      }
    }, 10000);
    
    return () => clearTimeout(timeoutId);
  }, []);

  // Show loading indicator while checking session
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
          <p className="mt-4">Preparing your workspace...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center p-8 bg-white rounded-lg shadow-md">
          <p className="text-red-500 mb-4">{error}</p>
          {showRetry && (
            <div className="space-y-2">
              <Button onClick={() => navigate("/auth")}>Go to Login</Button>
              <Button variant="outline" onClick={checkSession}>Retry</Button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // This component will not render anything since we always navigate away
  return null;
};

export default Index;
