
import { useState } from "react";

interface FormState {
  email: string;
  password: string;
  name: string;
  companyName: string;
  rememberMe: boolean;
}

const initialState: FormState = {
  email: "",
  password: "",
  name: "",
  companyName: "",
  rememberMe: false
};

export function useFormState() {
  const [formData, setFormData] = useState<FormState>(initialState);

  const updateField = (field: keyof FormState, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData(initialState);
  };

  return {
    formData,
    updateField,
    resetForm,
    setEmail: (value: string) => updateField('email', value),
    setPassword: (value: string) => updateField('password', value),
    setName: (value: string) => updateField('name', value),
    setCompanyName: (value: string) => updateField('companyName', value),
    setRememberMe: (value: boolean) => updateField('rememberMe', value)
  };
}
