
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { SignInFields, SignUpFields } from "./AuthFormFields";
import { useAuth } from "@/hooks/useAuth";

interface AuthFormProps {
  isSignUp: boolean;
  onSuccess: (email: string) => void;
  onError: (message: string) => void;
}

const AuthForm = ({ isSignUp, onSuccess, onError }: AuthFormProps) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const { isSubmitting, signIn, signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isSignUp) {
        // Handle sign up
        const { success, error } = await signUp(email, password, name);
        
        if (success) {
          onSuccess(email);
        } else if (error) {
          onError(error);
        }
      } else {
        // Handle sign in
        const { success, error } = await signIn(email, password);
        
        if (success) {
          onSuccess(email);
        } else if (error) {
          onError(error);
        }
      }
    } catch (error: any) {
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
