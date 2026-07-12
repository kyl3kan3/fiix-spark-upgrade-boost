
import React from "react";
import AuthHeader from "./AuthHeader";
import AuthError from "./AuthError";
import AuthForm from "./AuthForm";
import InviteMessage from "./InviteMessage";

interface AuthContentProps {
  isSignUp: boolean;
  error: string | null;
  onError: (message: string) => void;
  onToggleMode: () => void;
}

export const AuthContent: React.FC<AuthContentProps> = ({
  isSignUp,
  error,
  onError,
  onToggleMode,
}) => {
  return (
    <div className="space-y-6">
      <AuthHeader isSignUp={isSignUp} />

      {/* Tab toggle */}
      <div className="flex p-1 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => isSignUp && onToggleMode()}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-ui duration-200 ${
            !isSignUp
              ? "bg-background shadow-sm text-primary"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => !isSignUp && onToggleMode()}
          className={`flex-1 py-2 text-sm font-semibold rounded-md transition-ui duration-200 ${
            isSignUp
              ? "bg-background shadow-sm text-primary"
              : "text-muted-foreground hover:text-primary"
          }`}
        >
          Create Account
        </button>
      </div>

      {isSignUp && <InviteMessage />}
      <AuthError message={error} />
      <AuthForm isSignUp={isSignUp} onError={onError} />
    </div>
  );
};
