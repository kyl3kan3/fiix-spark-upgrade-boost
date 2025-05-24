
// Authentication form constants
export const AUTH_FIELD_LABELS = {
  FULL_NAME: "Full Name",
  EMAIL: "Email",
  COMPANY_NAME: "Company Name",
  PASSWORD: "Password",
  REMEMBER_ME: "Remember me"
} as const;

export const AUTH_PLACEHOLDERS = {
  FULL_NAME: "John Doe",
  EMAIL: "you@example.com",
  COMPANY_NAME: "Acme Corp",
  PASSWORD: "••••••••"
} as const;

export const AUTH_AUTOCOMPLETE = {
  EMAIL: "email",
  CURRENT_PASSWORD: "current-password",
  NEW_PASSWORD: "new-password"
} as const;

export const AUTH_BUTTON_TEXT = {
  SIGN_IN: "Sign In",
  SIGNING_IN: "Signing in...",
  CREATE_ACCOUNT: "Create Account",
  CREATING_ACCOUNT: "Creating Account...",
  SIGN_UP_TOGGLE: "Need an account? Sign up",
  SIGN_IN_TOGGLE: "Already have an account? Sign in"
} as const;

export const AUTH_HEADERS = {
  SIGN_UP: "Create your account",
  SIGN_IN: "Sign in to your account"
} as const;

export const AUTH_STORAGE_KEYS = {
  REMEMBER_ME: "auth_remember_me",
  PENDING_EMAIL: "pending_auth_email",
  AUTH_ERROR: "auth_error",
  SETUP_COMPLETE: "maintenease_setup_complete"
} as const;

export const AUTH_VALIDATION = {
  MIN_PASSWORD_LENGTH: 6
} as const;

export const AUTH_COLORS = {
  PRIMARY: "maintenease-600",
  PRIMARY_HOVER: "maintenease-700",
  PRIMARY_TEXT: "maintenease-600",
  PRIMARY_TEXT_HOVER: "maintenease-800"
} as const;
