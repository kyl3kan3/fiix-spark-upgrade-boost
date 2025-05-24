
import { useState } from "react";
import { useAuthOperations } from "../useAuthOperations";

export function useSignIn() {
  const [isLoading, setIsLoading] = useState(false);
  const { signIn: performSignIn } = useAuthOperations();

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      return await performSignIn(email, password);
    } finally {
      setIsLoading(false);
    }
  };

  return { signIn, isLoading };
}
