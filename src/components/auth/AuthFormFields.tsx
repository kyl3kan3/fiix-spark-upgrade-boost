import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff } from "lucide-react";

interface SignInFieldsProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  rememberMe: boolean;
  setRememberMe: (checked: boolean) => void;
}

export const SignInFields = ({
  email,
  setEmail,
  password,
  setPassword,
  rememberMe,
  setRememberMe
}: SignInFieldsProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6 rounded-md">
      <div>
        <Label htmlFor="email-address" className="text-[#403e43] dark:text-white mb-1 font-semibold">Email address</Label>
        <Input
          id="email-address"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="mt-1 focus:ring-2 focus:ring-[#9b87f5] border-none bg-white/80 dark:bg-card/80 placeholder:text-gray-400 text-black dark:text-white shadow-sm transition-shadow duration-150"
        />
      </div>
      <div>
        <Label htmlFor="password" className="text-[#403e43] dark:text-white mb-1 font-semibold">Password</Label>
        <div className="relative">
          <Input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="mt-1 focus:ring-2 focus:ring-[#9b87f5] border-none pr-10 bg-white/80 dark:bg-card/80 text-black dark:text-white shadow-sm transition-shadow duration-150"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 focus:outline-none hover:scale-110 transition-all"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
      <div className="flex items-center space-x-2">
        <Checkbox 
          id="remember-me" 
          checked={rememberMe}
          onCheckedChange={(checked) => setRememberMe(checked as boolean)}
        />
        <Label htmlFor="remember-me" className="text-sm font-medium cursor-pointer text-[#403e43] dark:text-white">
          Stay logged in
        </Label>
      </div>
    </div>
  );
};

interface SignUpFieldsProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  name: string;
  setName: (name: string) => void;
}

export const SignUpFields = ({
  email,
  setEmail,
  password,
  setPassword,
  name,
  setName
}: SignUpFieldsProps) => {
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="space-y-6 rounded-md">
      <div>
        <Label htmlFor="name" className="text-[#403e43] dark:text-white mb-1 font-semibold">Full Name</Label>
        <Input
          id="name"
          name="name"
          type="text"
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="John Doe"
          className="mt-1 focus:ring-2 focus:ring-[#9b87f5] border-none bg-white/80 dark:bg-card/80 placeholder:text-gray-400 text-black dark:text-white shadow-sm transition-shadow duration-150"
        />
      </div>
      <div>
        <Label htmlFor="email-address" className="text-[#403e43] dark:text-white mb-1 font-semibold">Email address</Label>
        <Input
          id="email-address"
          name="email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
          className="mt-1 focus:ring-2 focus:ring-[#9b87f5] border-none bg-white/80 dark:bg-card/80 placeholder:text-gray-400 text-black dark:text-white shadow-sm transition-shadow duration-150"
        />
      </div>
      <div>
        <Label htmlFor="password" className="text-[#403e43] dark:text-white mb-1 font-semibold">Password</Label>
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
            className="mt-1 focus:ring-2 focus:ring-[#9b87f5] border-none pr-10 bg-white/80 dark:bg-card/80 text-black dark:text-white shadow-sm transition-shadow duration-150"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 dark:text-gray-300 focus:outline-none hover:scale-110 transition-all"
            tabIndex={-1}
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
      </div>
    </div>
  );
};
