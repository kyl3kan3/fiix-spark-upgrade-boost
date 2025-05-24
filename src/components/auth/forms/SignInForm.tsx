
import React from "react";
import { Button } from "@/components/ui/button";
import { EmailField } from "./fields/EmailField";
import { PasswordField } from "./fields/PasswordField";
import { RememberMeField } from "./fields/RememberMeField";
import { useSignInForm } from "./hooks/useSignInForm";
import { AUTH_BUTTON_TEXT, AUTH_COLORS } from "@/constants/authConstants";

interface SignInFormProps {
  onError: (message: string) => void;
}

export const SignInForm: React.FC<SignInFormProps> = ({ onError }) => {
  const {
    email,
    setEmail,
    password,
    setPassword,
    rememberMe,
    setRememberMe,
    isLoading,
    handleSubmit
  } = useSignInForm(onError);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <EmailField
        value={email}
        onChange={setEmail}
        disabled={isLoading}
      />
      
      <PasswordField
        value={password}
        onChange={setPassword}
        disabled={isLoading}
      />
      
      <RememberMeField
        checked={rememberMe}
        onChange={setRememberMe}
        disabled={isLoading}
      />

      <Button
        type="submit"
        className={`w-full bg-${AUTH_COLORS.PRIMARY} hover:bg-${AUTH_COLORS.PRIMARY_HOVER}`}
        disabled={isLoading}
      >
        {isLoading ? AUTH_BUTTON_TEXT.SIGNING_IN : AUTH_BUTTON_TEXT.SIGN_IN}
      </Button>
    </form>
  );
};
