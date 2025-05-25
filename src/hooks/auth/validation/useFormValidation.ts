
// Re-export from the unified validation hook for backward compatibility
import { useUnifiedAuthValidation } from "./useUnifiedAuthValidation";

export function useFormValidation() {
  const { validateFormField } = useUnifiedAuthValidation();
  
  return { 
    validateFormField 
  };
}
