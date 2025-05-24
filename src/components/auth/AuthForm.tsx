
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { SignInForm } from "./forms/SignInForm";
import { SignUpForm } from "./forms/SignUpForm";

interface AuthFormProps {
  isSignUp: boolean;
  onSuccess: (email: string) => void;
  onError: (message: string) => void;
}

const AuthForm = ({ isSignUp, onSuccess, onError }: AuthFormProps) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is already authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  const handleSuccess = (email: string) => {
    localStorage.setItem("last_email", email);
    onSuccess(email);
    if (!isSignUp) {
      navigate("/dashboard");
    }
  };

  const handleError = (message: string) => {
    onError(message);
  };

  return (
    <div className="mt-8">
      {isSignUp ? (
        <SignUpForm onSuccess={handleSuccess} onError={handleError} />
      ) : (
        <SignInForm onSuccess={handleSuccess} onError={handleError} />
      )}
    </div>
  );
};

export default AuthForm;
