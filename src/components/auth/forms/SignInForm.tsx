
import React from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { EmailField, PasswordField, CheckboxField } from "./AuthFormFields";
import { useAuthForm } from "../../../hooks/auth/forms/useAuthForm";
import { AUTH_BUTTON_TEXT } from "@/constants/authConstants";
import { FormSubmissionProps } from "@/types/forms";
import { GoogleSignInButton } from "../GoogleSignInButton";

export const SignInForm: React.FC<FormSubmissionProps> = ({ onError }) => {
 const {
 email,
 setEmail,
 password,
 setPassword,
 rememberMe,
 setRememberMe,
 isLoading,
 handleSubmit
 } = useAuthForm({ isSignUp: false, onError });

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
 
 <CheckboxField
 checked={rememberMe}
 onChange={setRememberMe}
 disabled={isLoading}
 />

  <div className="flex justify-end">
    <Link
      to="/forgot-password"
      className="text-sm text-primary hover:underline"
    >
      Forgot password?
    </Link>
  </div>

 <Button
 type="submit"
 className="w-full bg-primary text-primary-foreground hover:bg-primary-variant shadow-sm uppercase tracking-wide font-semibold transition-ui hover:-translate-y-0.5"
 disabled={isLoading}
 >
 {isLoading ? AUTH_BUTTON_TEXT.SIGNING_IN : AUTH_BUTTON_TEXT.SIGN_IN}
 </Button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <GoogleSignInButton label="Sign in with Google" disabled={isLoading} />
 </form>
 );
};
