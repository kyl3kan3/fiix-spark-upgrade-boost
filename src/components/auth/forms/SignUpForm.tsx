
import React, { useState, useCallback, useEffect } from "react";
import { getStorageItem } from "@/utils/storageUtils";
import { Button } from "@/components/ui/button";
import { EmailField, PasswordField, NameField, CompanyNameField } from "./AuthFormFields";
import { useAuthForm } from "../../../hooks/auth/forms/useAuthForm";
import { AUTH_BUTTON_TEXT, AUTH_AUTOCOMPLETE, AUTH_FIELD_LABELS } from "@/constants/authConstants";
import { FormSubmissionProps } from "@/types/forms";
import { TurnstileWidget } from "../TurnstileWidget";
import { GoogleSignInButton } from "../GoogleSignInButton";

export const SignUpForm: React.FC<FormSubmissionProps> = ({ onError }) => {
 const {
 email,
 setEmail,
 password,
 setPassword,
 name,
 setName,
 companyName,
 setCompanyName,
 isLoading,
 handleSubmit
 } = useAuthForm({ isSignUp: true, onError });
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [pendingInvite, setPendingInvite] = useState(
    () => !!getStorageItem("pending_invite_token"),
  );
  const onVerify = useCallback((t: string) => setTurnstileToken(t), []);
  const onExpire = useCallback(() => setTurnstileToken(null), []);

  useEffect(() => {
    const invitedCompany = getStorageItem("pending_invite_company");
    if (invitedCompany) setCompanyName(invitedCompany);
    const onCompany = () => {
      setPendingInvite(!!getStorageItem("pending_invite_token"));
      const name = getStorageItem("pending_invite_company");
      if (name) setCompanyName(name);
    };
    window.addEventListener("pending-invite-company-resolved", onCompany);
    return () => window.removeEventListener("pending-invite-company-resolved", onCompany);
  }, [setCompanyName]);

  const onSubmit = (e: React.FormEvent) => handleSubmit(e, turnstileToken || undefined);

 return (
    <form onSubmit={onSubmit} className="space-y-4">
 <NameField
 value={name}
 onChange={setName}
 disabled={isLoading}
 />
 
 <EmailField
 value={email}
 onChange={setEmail}
 disabled={isLoading}
 />
 
 {!pendingInvite && (
 <CompanyNameField
 value={companyName}
 onChange={setCompanyName}
 disabled={isLoading}
 />
 )}
 
 <PasswordField
 value={password}
 onChange={setPassword}
 label={AUTH_FIELD_LABELS.PASSWORD}
 autoComplete={AUTH_AUTOCOMPLETE.NEW_PASSWORD}
 disabled={isLoading}
 />

      <TurnstileWidget onVerify={onVerify} onExpire={onExpire} />

 <Button
 type="submit"
 className="w-full bg-primary text-primary-foreground hover:bg-primary-variant shadow-sm uppercase tracking-wide font-semibold transition-ui hover:-translate-y-0.5"
        disabled={isLoading || !turnstileToken}
 >
 {isLoading ? AUTH_BUTTON_TEXT.CREATING_ACCOUNT : AUTH_BUTTON_TEXT.CREATE_ACCOUNT}
 </Button>

      <div className="relative my-2">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center text-xs uppercase">
          <span className="bg-background px-2 text-muted-foreground">Or</span>
        </div>
      </div>

      <GoogleSignInButton label="Sign up with Google" disabled={isLoading} />
 </form>
 );
};
