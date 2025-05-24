
import React from "react";
import { Button } from "@/components/ui/button";
import { EmailField } from "./fields/EmailField";
import { PasswordField } from "./fields/PasswordField";
import { NameField } from "./fields/NameField";
import { CompanyNameField } from "./fields/CompanyNameField";
import { useSignUpForm } from "./hooks/useSignUpForm";

interface SignUpFormProps {
  onError: (message: string) => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onError }) => {
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
  } = useSignUpForm(onError);

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
        label="Password"
        autoComplete="new-password"
        disabled={isLoading}
      />

      <Button
        type="submit"
        className="w-full bg-maintenease-600 hover:bg-maintenease-700"
        disabled={isLoading}
      >
        {isLoading ? "Creating Account..." : "Create Account"}
      </Button>
    </form>
  );
};
