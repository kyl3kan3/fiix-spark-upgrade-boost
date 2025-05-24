
// Shared authentication types
export interface AuthUser {
  id: string;
  email: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  companyName?: string;
}

export interface AuthSession {
  user: AuthUser;
  accessToken: string;
  refreshToken?: string;
  expiresAt?: number;
}

export interface AuthError {
  message: string;
  code?: string;
  type?: 'validation' | 'network' | 'auth' | 'unknown';
}

export interface AuthResult {
  success: boolean;
  error?: string;
  user?: AuthUser;
  session?: AuthSession;
}

export interface SignInCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface SignUpCredentials {
  email: string;
  password: string;
  name: string;
  companyName: string;
}

export interface UserMetadata {
  first_name?: string;
  last_name?: string;
  company_name?: string;
  [key: string]: any;
}
