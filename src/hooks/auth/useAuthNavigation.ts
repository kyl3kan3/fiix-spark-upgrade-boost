
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect, useCallback } from "react";

export function useAuthNavigation() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

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
