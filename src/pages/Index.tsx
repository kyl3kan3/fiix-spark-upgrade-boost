
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/auth";

const Index = () => {
  const navigate = useNavigate();
  const { isAuthenticated, isLoading } = useAuth();

  useEffect(() => {
    // If authentication status is determined
    if (!isLoading) {
      if (isAuthenticated) {
        // Redirect authenticated users to dashboard
        navigate("/dashboard", { replace: true });
      } else {
        // Redirect non-authenticated users to auth page
        navigate("/auth", { replace: true });
      }
    }
  }, [isAuthenticated, isLoading, navigate]);

  // Show loading indicator while checking auth status
  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
        <p className="mt-4">Preparing your workspace...</p>
      </div>
    </div>
  );
};

export default Index;
