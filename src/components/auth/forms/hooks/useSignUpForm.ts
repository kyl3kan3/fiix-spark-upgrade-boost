
import { useFormState } from "@/hooks/auth/forms/useFormState";
import { useAuthSubmission } from "@/hooks/auth/forms/useAuthSubmission";

export function useSignUpForm(onError: (message: string) => void) {
  const { formData, setEmail, setPassword, setName, setCompanyName } = useFormState();
  const { handleSignUp, isLoading } = useAuthSubmission({ onError });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await handleSignUp(formData.email, formData.password, formData.name, formData.companyName);
  };

  return {
    email: formData.email,
    setEmail,
    password: formData.password,
    setPassword,
    name: formData.name,
    setName,
    companyName: formData.companyName,
    setCompanyName,
    isLoading,
    handleSubmit
  };
}
