import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Eye, EyeOff } from "lucide-react";
import { useSignUp } from "@/hooks/auth/actions/useSignUp";
import { useAuthNavigation } from "@/hooks/auth/useAuthNavigation";
import { useFormValidation } from "@/hooks/auth/validation/useFormValidation";

interface SignUpFormProps {
  onError: (message: string) => void;
}

export const SignUpForm: React.FC<SignUpFormProps> = ({ onError }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  
  const { signUp, isLoading } = useSignUp();
  const { handleAuthSuccess } = useAuthNavigation();
  const { validateSignUpForm } = useFormValidation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateSignUpForm(email, password, name, companyName);
    if (!validation.isValid) {
      onError(validation.error!);
      return;
    }
    
    const result = await signUp(email, password, {
      first_name: name.split(' ')[0],
      last_name: name.split(' ').slice(1).join(' '),
      company_name: companyName
    });
    
    if (result.success) {
      localStorage.setItem("pending_auth_email", email);
      handleAuthSuccess();
    } else if (result.error) {
      onError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="name">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="mt-1"
          disabled={isLoading}
        />
      </div>
      
      <div>
        <Label htmlFor="email-address">Email address</Label>
        <Input
          id="email-address"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="your@email.com"
          className="mt-1"
          disabled={isLoading}
        />
      </div>
      
      <div>
        <Label htmlFor="company-name">Company Name</Label>
        <Input
          id="company-name"
          name="companyName"
          type="text"
          required
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          placeholder="Acme Corp"
          className="mt-1"
          disabled={isLoading}
        />
      </div>
      
      <div>
        <Label htmlFor="password">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1"
            disabled={isLoading}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
            tabIndex={-1}
            disabled={isLoading}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>

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
