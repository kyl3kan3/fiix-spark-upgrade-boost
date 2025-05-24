
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useEffect } from "react";

export function useAuthNavigation() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleAuthSuccess = (email: string, isSignUp: boolean) => {
    localStorage.setItem("last_email", email);
    if (!isSignUp) {
      navigate("/dashboard", { replace: true });
    }
  };

  return { handleAuthSuccess };
}
