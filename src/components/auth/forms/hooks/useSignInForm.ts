
import { useState } from "react";
import { useSignIn } from "@/hooks/auth/actions/useSignIn";
import { useAuthNavigation } from "@/hooks/auth/useAuthNavigation";
import { useFormValidation } from "@/hooks/auth/validation/useFormValidation";

export function useSignInForm(onError: (message: string) => void) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  
  const { signIn, isLoading } = useSignIn();
  const { handleAuthSuccess } = useAuthNavigation();
  const { validateSignInForm } = useFormValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateSignInForm(email, password);
    if (!validation.isValid) {
      onError(validation.error!);
      return;
    }

    const result = await signIn(email, password);
    
    if (result.success) {
      if (rememberMe) {
        localStorage.setItem("auth_remember_me", "true");
      } else {
        localStorage.removeItem("auth_remember_me");
      }
      handleAuthSuccess();
    } else if (result.error) {
      onError(result.error);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    isLoading,
    handleSubmit
  };
}
