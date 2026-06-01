
import React from "react";
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
    <div className="space-y-8">
      {/* Form Header */}
      <div className="text-center md:text-left space-y-2">
        <h2 className="font-headline-lg text-headline-lg md:font-display-lg md:text-display-lg text-on-background">
          {isSignUp ? "Create Account" : "Welcome back"}
        </h2>
        <p className="font-body-md text-body-md text-on-surface-variant">
          {isSignUp
            ? "Start managing your facilities with precision."
            : "Enter your credentials to access your dashboard."}
        </p>
      </div>

      {/* Auth Toggle (Login / Sign Up) */}
      <div className="flex p-1 bg-surface-container-low rounded-lg shadow-inner">
        <button
          type="button"
          onClick={() => isSignUp && onToggleMode()}
          className={`flex-1 py-2 font-label-md text-label-md rounded-md transition-all duration-200 ${
            !isSignUp
              ? "bg-surface shadow-sm text-primary"
              : "text-on-surface-variant hover:text-primary"
          }`}
        >
          Log In
        </button>
        <button
          type="button"
          onClick={() => !isSignUp && onToggleMode()}
          className={`flex-1 py-2 font-label-md text-label-md rounded-md transition-all duration-200 ${
            isSignUp
              ? "bg-surface shadow-sm text-primary"
              : "text-on-surface-variant hover:text-primary"
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
