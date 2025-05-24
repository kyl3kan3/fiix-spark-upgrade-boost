
export interface AuthError {
  message: string;
  code?: string;
}

export const parseAuthError = (error: any): AuthError => {
  // Handle Supabase auth errors
  if (error?.message) {
    return {
      message: error.message,
      code: error.code || error.error_code
    };
  }
  
  // Handle string errors
  if (typeof error === 'string') {
    return { message: error };
  }
  
  // Default fallback
  return { message: 'An unexpected error occurred' };
};

export const getErrorMessage = (error: any): string => {
  const parsed = parseAuthError(error);
  return parsed.message;
};

export const isAuthError = (error: any): boolean => {
  return error && (error.message || typeof error === 'string');
};
