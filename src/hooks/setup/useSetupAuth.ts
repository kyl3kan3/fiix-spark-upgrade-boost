
import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/auth";
import { useNavigate } from "react-router-dom";

export function useSetupAuth() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      navigate("/auth");
    }
  }, [isAuthenticated, authLoading, navigate]);

  return {
    isAuthenticated,
    isAuthLoading: authLoading
  };
}
