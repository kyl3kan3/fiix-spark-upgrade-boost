
import React from "react";
import AuthHeader from "./AuthHeader";
import AuthError from "./AuthError";
import AuthForm from "./AuthForm";
import AuthToggle from "./AuthToggle";
import { DemoSetupButton } from "./DemoSetupButton";

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
    <>
      <AuthHeader isSignUp={isSignUp} />
      <AuthError message={error} />
      <AuthForm isSignUp={isSignUp} onError={onError} />
      <AuthToggle isSignUp={isSignUp} onToggle={onToggleMode} />
      <DemoSetupButton />
    </>
  );
};
