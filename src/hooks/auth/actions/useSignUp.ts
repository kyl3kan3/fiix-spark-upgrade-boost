
import { useState } from "react";
import { useAuthOperations } from "../useAuthOperations";

interface SignUpData {
  first_name?: string;
  last_name?: string;
  company_name?: string;
}

export function useSignUp() {
  const [isLoading, setIsLoading] = useState(false);
  const { signUp: performSignUp } = useAuthOperations();

  const signUp = async (email: string, password: string, userData?: SignUpData) => {
    setIsLoading(true);
    try {
      return await performSignUp(email, password, userData);
    } finally {
      setIsLoading(false);
    }
  };

  return { signUp, isLoading };
}
