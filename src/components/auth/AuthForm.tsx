
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
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
        const { success, error } = await signUp(email, password, name);
        if (success) {
          onSuccess(email);
        } else if (error) {
          onError(error);
        }
      } else {
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
    <form
      className="mt-8 space-y-6 animate-fade-in transition-all duration-500"
      onSubmit={handleSubmit}
      aria-label={isSignUp ? "Sign up form" : "Sign in form"}
      autoComplete="on"
    >
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
          className="w-full bg-[#9b87f5] hover:bg-[#7e6ad4] rounded-lg h-11 font-bold text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          aria-disabled={isSubmitting}
        >
          {isSubmitting && (
            <Loader2 className="animate-spin mr-2" size={20} />
          )}
          {isSubmitting
            ? "Processing..."
            : isSignUp
              ? "Create Account"
              : "Sign In"}
        </Button>
      </div>
    </form>
  );
};

export default AuthForm;
