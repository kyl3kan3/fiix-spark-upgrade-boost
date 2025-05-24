
import { useNavigate } from "react-router-dom";
import { useCallback } from "react";

export function useAuthNavigation() {
  const navigate = useNavigate();

  const handleAuthSuccess = useCallback(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  const redirectToAuth = useCallback(() => {
    navigate("/auth", { replace: true });
  }, [navigate]);

  const redirectToDashboard = useCallback(() => {
    navigate("/dashboard", { replace: true });
  }, [navigate]);

  return { 
    handleAuthSuccess,
    redirectToAuth,
    redirectToDashboard
  };
}
