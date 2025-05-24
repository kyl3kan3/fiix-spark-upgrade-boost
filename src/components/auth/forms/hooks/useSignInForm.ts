
import { useFormState } from "@/hooks/auth/forms/useFormState";
import { useSignInSubmission } from "@/hooks/auth/forms/useSignInSubmission";

export function useSignInForm(onError: (message: string) => void) {
  const { formData, setEmail, setPassword, setRememberMe } = useFormState();
  const { handleSignIn, isLoading } = useSignInSubmission({ onError });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignIn(formData.email, formData.password, formData.rememberMe);
  };

  return {
    email: formData.email,
    setEmail,
    password: formData.password,
    setPassword,
    rememberMe: formData.rememberMe,
    setRememberMe,
    isLoading,
    handleSubmit
  };
}
