
import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

export function useSetupCompletion() {
  const [isCompleting, setIsCompleting] = useState(false);
  const navigate = useNavigate();

  const completeSetup = useCallback(async () => {
    try {
      setIsCompleting(true);
      
      // Mark setup as complete in localStorage
      localStorage.setItem('maintenease_setup_complete', 'true');
      
      toast.success("Setup completed successfully!");
      navigate("/dashboard");
    } catch (error) {
      console.error("Error completing setup:", error);
      toast.error("Failed to complete setup");
    } finally {
      setIsCompleting(false);
    }
  }, [navigate]);

  return {
    isCompleting,
    completeSetup
  };
}
