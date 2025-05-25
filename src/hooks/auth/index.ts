
// Core auth hooks
export { useAuthContext as useAuth } from "./useAuthContext";
export { useAuthState } from "./useAuthState";
export { useAuthOperations } from "./core/useAuthOperations";
export { useAuthActions } from "./useAuthActions";
export { useAuthNavigation } from "./useAuthNavigation";
export { useAuthErrorHandler } from "./useAuthErrorHandler";

// Validation hooks
export { useUnifiedAuthValidation } from "./validation/useUnifiedAuthValidation";
export { useAuthValidation } from "./validation/useAuthValidation";
export { useFormValidation } from "./validation/useFormValidation";

// Form hooks
export { useAuthForm } from "./forms/useAuthForm";
export { useAuthSubmission } from "./forms/useAuthSubmission";
export { useFormState } from "./forms/useFormState";

// Legacy compatibility exports
export { useSignIn } from "./actions/useSignIn";
export { useSignUp } from "./actions/useSignUp";
export { useSignOut } from "./actions/useSignOut";
export { useSignInSubmission } from "./forms/useSignInSubmission";
export { useSignUpSubmission } from "./forms/useSignUpSubmission";
