
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SignInFields, SignUpFields } from "./AuthFormFields";
import { useAuth } from "@/hooks/useAuth";
import { useNavigate } from "react-router-dom";

interface AuthFormProps {
  isSignUp: boolean;
  onSuccess: (email: string) => void;
  onError: (message: string) => void;
}

const AuthForm = ({ isSignUp, onSuccess, onError }: AuthFormProps) => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const { isSubmitting, signIn, signUp, isAuthenticated } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  // Check for email from previous screen or localStorage
  useEffect(() => {
    const pendingEmail = localStorage.getItem("pending_auth_email");
    if (pendingEmail) {
      setEmail(pendingEmail);
    }
    
    // Check for company name from localStorage
    const pendingCompanyName = localStorage.getItem("pending_company_name");
    if (pendingCompanyName && isSignUp) {
      setCompanyName(pendingCompanyName);
    }
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isSignUp) {
        // Handle sign up with company name
        const { success, error } = await signUp(email, password, name, companyName);
        
        if (success) {
          console.log("Signup successful, redirecting to onboarding");
          localStorage.setItem("pending_auth_email", email);
          onSuccess(email);
        } else if (error) {
          onError(error);
        }
      } else {
        // Handle sign in
        const { success, error, session } = await signIn(email, password);
        
        if (success && session) {
          console.log("Login successful, redirecting to dashboard");
          if (rememberMe) {
            localStorage.setItem("supabase.auth.token", JSON.stringify(session));
          }
          onSuccess(email);
          // Redirect to dashboard
          navigate("/dashboard");
        } else if (error) {
          onError(error);
        }
      }
    } catch (error: any) {
      console.error("Unexpected error during authentication:", error);
      onError("An unexpected error occurred");
    }
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      {isSignUp ? (
        <SignUpFields
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          name={name}
          setName={setName}
          companyName={companyName}
          setCompanyName={setCompanyName}
        />
      ) : (
        <SignInFields
          email={email}
          setEmail={setEmail}
          password={password}
          setPassword={setPassword}
          rememberMe={rememberMe}
          setRememberMe={setRememberMe}
        />
      )}

      <div>
        <Button
          type="submit"
          className="w-full bg-maintenease-600 hover:bg-maintenease-700"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
        </Button>
      </div>
    </form>
  );
};

export default AuthForm;
