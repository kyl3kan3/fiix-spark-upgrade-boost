
import React from "react";
import { Button } from "@/components/ui/button";
import { EmailField, PasswordField, NameField, CompanyNameField } from "./AuthFormFields";
import { useAuthForm } from "../../../hooks/auth/forms/useAuthForm";
import { AUTH_BUTTON_TEXT, AUTH_COLORS, AUTH_AUTOCOMPLETE, AUTH_FIELD_LABELS } from "@/constants/authConstants";
import { FormSubmissionProps } from "@/types/forms";

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

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
      
      <CompanyNameField
        value={companyName}
        onChange={setCompanyName}
        disabled={isLoading}
      />
      
      <PasswordField
        value={password}
        onChange={setPassword}
        label={AUTH_FIELD_LABELS.PASSWORD}
        autoComplete={AUTH_AUTOCOMPLETE.NEW_PASSWORD}
        disabled={isLoading}
      />

      <Button
        type="submit"
        className={`w-full bg-${AUTH_COLORS.PRIMARY} hover:bg-${AUTH_COLORS.PRIMARY_HOVER}`}
        disabled={isLoading}
      >
        {isLoading ? AUTH_BUTTON_TEXT.CREATING_ACCOUNT : AUTH_BUTTON_TEXT.CREATE_ACCOUNT}
      </Button>
    </form>
  );
};
