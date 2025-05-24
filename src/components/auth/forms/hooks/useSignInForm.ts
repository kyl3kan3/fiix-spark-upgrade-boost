
import { useFormState } from "@/hooks/auth/forms/useFormState";
import { useAuthSubmission } from "@/hooks/auth/forms/useAuthSubmission";

export function useSignInForm(onError: (message: string) => void) {
  const { formData, setEmail, setPassword, setRememberMe } = useFormState();
  const { handleSignIn, isLoading } = useAuthSubmission({ onError });

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
