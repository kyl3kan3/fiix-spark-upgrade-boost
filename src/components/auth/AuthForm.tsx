
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
  
  const { isSubmitting, signIn, signUp, isAuthenticated, refreshSession } = useAuth();
  
  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      console.log("User is already authenticated, redirecting to dashboard");
      navigate("/dashboard");
    }
    
    // Try refreshing session once on page load
    const refreshAuthSession = async () => {
      await refreshSession();
    };
    
    refreshAuthSession();
  }, [isAuthenticated, navigate, refreshSession]);
  
  // Check for email from previous screen or localStorage
  useEffect(() => {
    // First check for any pending auth email
    const pendingEmail = localStorage.getItem("pending_auth_email");
    if (pendingEmail) {
      setEmail(pendingEmail);
    } else {
      // Fallback to last used email for convenience
      const lastEmail = localStorage.getItem("last_email");
      if (lastEmail) {
        setEmail(lastEmail);
      }
    }
    
    // Check for company name from localStorage
    const pendingCompanyName = localStorage.getItem("pending_company_name");
    if (pendingCompanyName && isSignUp) {
      setCompanyName(pendingCompanyName);
    }

    // Check for remember me preference
    const remembered = localStorage.getItem("auth_remember_me");
    if (remembered === "true") {
      setRememberMe(true);
    }
  }, [isSignUp]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isSignUp) {
        // Handle sign up with name and company name
        const { success, error } = await signUp(email, password, {
          first_name: name,
          company_name: companyName
        });
        
        if (success) {
          console.log("Signup successful, redirecting to onboarding");
          localStorage.setItem("pending_auth_email", email);
          onSuccess(email);
        } else if (error) {
          onError(error);
        }
      } else {
        // Handle sign in
        console.log("Attempting to sign in with email:", email);
        const { success, error, session } = await signIn(email, password);
        
        if (success && session) {
          console.log("Login successful, redirecting to dashboard");
          if (rememberMe) {
            localStorage.setItem("auth_remember_me", "true");
          } else {
            localStorage.removeItem("auth_remember_me");
          }
          onSuccess(email);
          // Redirect to dashboard
          navigate("/dashboard");
        } else if (error) {
          console.error("Login failed:", error);
          onError(error);
        }
      }
    } catch (error: any) {
      console.error("Unexpected error during authentication:", error);
      onError(`An unexpected error occurred: ${error.message || "Please try again"}`);
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
      
      {/* Debug section in development */}
      {process.env.NODE_ENV === "development" && !isSignUp && (
        <div className="text-xs text-gray-500 mt-4 p-2 border border-gray-200 rounded">
          <p>Debug - Auth state:</p>
          <p>Is Submitting: {isSubmitting ? "true" : "false"}</p>
          <p>Is Authenticated: {isAuthenticated ? "true" : "false"}</p>
        </div>
      )}
    </form>
  );
};

export default AuthForm;
