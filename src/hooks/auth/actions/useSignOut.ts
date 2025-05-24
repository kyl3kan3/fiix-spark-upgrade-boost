
import { useState } from "react";
import { useAuthOperations } from "../useAuthOperations";

export function useSignOut() {
  const [isLoading, setIsLoading] = useState(false);
  const { signOut: performSignOut } = useAuthOperations();

  const signOut = async () => {
    setIsLoading(true);
    try {
      return await performSignOut();
    } finally {
      setIsLoading(false);
    }
  };

  return { signOut, isLoading };
}
