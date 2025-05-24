
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SignInFields, SignUpFields } from "./AuthFormFields";
import { useAuth } from "@/contexts/AuthContext";
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
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { signIn, signUp, isAuthenticated } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is already authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
  }, [isAuthenticated, navigate]);
  
  // Load saved form data
  useEffect(() => {
    const pendingEmail = localStorage.getItem("pending_auth_email");
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      const lastEmail = localStorage.getItem("last_email");
      if (lastEmail) {
        setEmail(lastEmail);
      }
    }
    
    const pendingCompanyName = localStorage.getItem("pending_company_name");
    if (pendingCompanyName && isSignUp) {
      setCompanyName(pendingCompanyName);
    }

    const remembered = localStorage.getItem("auth_remember_me");
    if (remembered === "true") {
      setRememberMe(true);
    }
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      if (isSignUp) {
        const { success, error } = await signUp(email, password, {
          first_name: name.split(' ')[0],
          last_name: name.split(' ').slice(1).join(' '),
          company_name: companyName
        });
        
        if (success) {
          console.log("Signup successful");
          localStorage.setItem("pending_auth_email", email);
          onSuccess(email);
        } else if (error) {
          onError(error);
        }
      } else {
        console.log("Attempting to sign in with email:", email);
        const { success, error } = await signIn(email, password);
        
        if (success) {
          console.log("Login successful, redirecting to dashboard");
          if (rememberMe) {
            localStorage.setItem("auth_remember_me", "true");
          } else {
            localStorage.removeItem("auth_remember_me");
          }
          onSuccess(email);
          navigate("/dashboard");
        } else if (error) {
          console.error("Login failed:", error);
          onError(error);
        }
      }
    } catch (error: any) {
      console.error("Unexpected error during authentication:", error);
      onError(`An unexpected error occurred: ${error.message || "Please try again"}`);
    } finally {
      setIsSubmitting(false);
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
