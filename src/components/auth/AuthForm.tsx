
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader } from "lucide-react";
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
      className="mt-8 space-y-6 animate-fade-in transition-all duration-500 relative"
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
          className="w-full bg-gradient-to-tr from-[#9b87f5] via-[#d6bcfa] to-[#7e6ad4] hover:from-[#a290fa] hover:to-[#b09afc] hover:scale-105 text-white rounded-lg h-12 font-bold text-base shadow-md transition-all duration-200 flex items-center justify-center gap-2 
            active:scale-95"
          disabled={isSubmitting}
          aria-busy={isSubmitting}
          aria-disabled={isSubmitting}
        >
          {isSubmitting && (
            <Loader className="animate-spin mr-2" size={22} />
          )}
          {isSubmitting
            ? "Processing..."
            : isSignUp
              ? "Create Account"
              : "Sign In"}
        </Button>
        {isSubmitting && (
          <div className="absolute inset-0 z-10 bg-white/80 dark:bg-background/80 flex items-center justify-center rounded-xl transition-all animate-fade-in">
            <Loader className="animate-spin text-[#9b87f5]" size={36}/>
          </div>
        )}
      </div>
    </form>
  );
};

export default AuthForm;
